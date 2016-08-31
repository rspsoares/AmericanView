using BrockAllen.MembershipReboot;
using BrockAllen.MembershipReboot.Ef;
using System;
using System.Linq;
using System.Data.Entity;
using System.Web;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations.Schema;
using BrockAllen.MembershipReboot.Relational;

namespace Keeptrue.Conciliador.View.Models
{
    public class AuthenticationAudit
    {
        public int ID { get; set; }
        public DateTime Date { get; set; }
        public string Activity { get; set; }
        public string Detail { get; set; }
        public string ClientIP { get; set; }
    }

    public class PasswordHistory
    {
        public int ID { get; set; }
        public Guid UserID { get; set; }
        public DateTime DateChanged { get; set; }
        [Required]
        public string PasswordHash { get; set; }
    }

    public class CustomUserAccount : RelationalUserAccount
    {
        public virtual int Source { get; set; }
        public virtual int Inscription { get; set; }
        public virtual string StartingPass { get; set; }

        [NotMapped]
        public string OtherFirstName
        {
            get
            {
                return this.GetClaimValue(ClaimTypes.GivenName);
            }
        }
    }

    public class CustomDatabase : DbContext
    {
        static CustomDatabase()
        {
            Database.SetInitializer<CustomDatabase>(new System.Data.Entity.MigrateDatabaseToLatestVersion<CustomDatabase, Configuration>());
        }

        public CustomDatabase()
            : this("name=Subscriptions")
        {
            this.RegisterUserAccountChildTablesForDelete<CustomUserAccount>();
        }

        public CustomDatabase(string connectionName)
            : base(connectionName)
        {
            this.RegisterUserAccountChildTablesForDelete<CustomUserAccount>();
        }

        public DbSet<CustomUserAccount> UserAccountsTableWithSomeOtherName { get; set; }
        public DbSet<AuthenticationAudit> Audits { get; set; }
        public DbSet<PasswordHistory> PasswordHistory { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.ConfigureMembershipRebootUserAccounts<CustomUserAccount>();
        }
    }

    public class CustomRepository : DbContextUserAccountRepository<CustomDatabase, CustomUserAccount>, IUserAccountRepository<CustomUserAccount>
    {
        // you can do either style ctor (or none) -- depends how much control 
        // you want over instantiating the CustomDatabase instance
        public CustomRepository()
            : base(new CustomDatabase())
        {
            this.isContextOwner = true;
        }
        public CustomRepository(string name)
            : base(new CustomDatabase(name))
        {
            this.isContextOwner = true;
        }
        public CustomRepository(CustomDatabase db)
            : base(db)
        {
        }

        protected override IQueryable<CustomUserAccount> DefaultQueryFilter(IQueryable<CustomUserAccount> query, string filter)
        {
            if (query == null) throw new ArgumentNullException("query");
            if (filter == null) throw new ArgumentNullException("filter");

            return
                from a in query
                from c in a.ClaimCollection
                where c.Value.Contains(filter)
                select a;
        }
    }

    public class PasswordValidator : IValidator<CustomUserAccount>
    {
        public ValidationResult Validate(UserAccountService<CustomUserAccount> service, CustomUserAccount account, string value)
        {
            if (value.Contains(account.Username))
            {
                return new ValidationResult("Por favor não utilize seu usuário em sua senha.");
            }

            if (value.Contains(account.Email))
            {
                return new ValidationResult("Por favor não utilize seu e-mail em sua senha");
            }

            return null;
        }
    }

    // this shows the extensibility point of being notified of account activity
    public class AuthenticationAuditEventHandler :
        IEventHandler<SuccessfulLoginEvent<CustomUserAccount>>,
        IEventHandler<FailedLoginEvent<CustomUserAccount>>
    {
        public void Handle(SuccessfulLoginEvent<CustomUserAccount> evt)
        {
            using (var db = new CustomDatabase())
            {
                var audit = new AuthenticationAudit
                {
                    Date = DateTime.UtcNow,
                    Activity = "Autenticação com sucesso!",
                    Detail = null,
                    ClientIP = HttpContext.Current.Request.UserHostAddress,
                };
                db.Audits.Add(audit);
                db.SaveChanges();
            }
        }

        public void Handle(FailedLoginEvent<CustomUserAccount> evt)
        {
            using (var db = new CustomDatabase())
            {
                var audit = new AuthenticationAudit
                {
                    Date = DateTime.UtcNow,
                    Activity = "Falha de Login",
                    Detail = evt.GetType().Name + ", Número de Falhas em Login: " + evt.Account.FailedLoginCount,
                    ClientIP = HttpContext.Current.Request.UserHostAddress,
                };
                db.Audits.Add(audit);
                db.SaveChanges();
            }
        }
    }

    public class NotifyAccountOwnerWhenTooManyFailedLoginAttempts
        : IEventHandler<TooManyRecentPasswordFailuresEvent<CustomUserAccount>>
    {
        public void Handle(TooManyRecentPasswordFailuresEvent<CustomUserAccount> evt)
        {
            var smtp = new SmtpMessageDelivery();
            var msg = new Message
            {
                To = evt.Account.Email,
                Subject = "Sua conta no Portal de Apuração de Tributos",
                Body = "Aparentemente você (ou alguém) tentou entrar em sua conta e errou a senha muitas vezes, sua conta está neste momento bloqueada. "
            };
            smtp.Send(msg);
        }
    }

    public class PasswordChanging :
        IEventHandler<PasswordChangedEvent<CustomUserAccount>>
    {
        public void Handle(PasswordChangedEvent<CustomUserAccount> evt)
        {
            using (var db = new CustomDatabase())
            {
                var oldEntires =
                    db.PasswordHistory.Where(x => x.UserID == evt.Account.ID).OrderByDescending(x => x.DateChanged).ToArray();
                for (var i = 0; i < 3 && oldEntires.Length > i; i++)
                {
                    var oldHash = oldEntires[i].PasswordHash;
                    if (new DefaultCrypto().VerifyHashedPassword(oldHash, evt.NewPassword))
                    {
                        throw new ValidationException("A nova senha não pode ser a igual a nenhum das 3 últimas utilizadas.");
                    }
                }
            }
        }
    }

    public class PasswordChanged :
        IEventHandler<AccountCreatedEvent<CustomUserAccount>>,
        IEventHandler<PasswordChangedEvent<CustomUserAccount>>
    {
        public void Handle(AccountCreatedEvent<CustomUserAccount> evt)
        {
            if (evt.InitialPassword != null)
            {
                AddPasswordHistoryEntry(evt.Account.ID, evt.InitialPassword);
            }
        }

        public void Handle(PasswordChangedEvent<CustomUserAccount> evt)
        {
            AddPasswordHistoryEntry(evt.Account.ID, evt.NewPassword);
        }

        private static void AddPasswordHistoryEntry(Guid accountID, string password)
        {
            using (var db = new CustomDatabase())
            {
                var pw = new PasswordHistory
                {
                    UserID = accountID,
                    DateChanged = DateTime.UtcNow,
                    PasswordHash = new DefaultCrypto().HashPassword(password, 1000)
                };
                db.PasswordHistory.Add(pw);
                db.SaveChanges();
            }
        }
    }

    // customize default email messages
    public class CustomEmailMessageFormatter : EmailMessageFormatter<CustomUserAccount>
    {
        public CustomEmailMessageFormatter(ApplicationInformation info)
            : base(info)
        {
        }

        protected override Tokenizer GetTokenizer(UserAccountEvent<CustomUserAccount> evt)
        {
            return new Tokenizer(evt.Account.StartingPass);
        }

        protected override string LoadBodyTemplate(UserAccountEvent<CustomUserAccount> evt)
        {
            if (evt is AccountCreatedEvent<CustomUserAccount> && !string.IsNullOrEmpty(evt.Account.StartingPass))
            {
                return LoadTemplate("AccountCreatedEvent_Custom_Body");
            }
            else
            {
                return LoadTemplate(CleanGenericName(evt.GetType()) + "_Body");
            }            
        }

        protected override string GetBody(UserAccountEvent<CustomUserAccount> evt, IDictionary<string, string> values)
        {
            //if (evt is EmailVerifiedEvent<CustomUserAccount>)
            //{
            //    return "sua conta foi verificado pelo " + this.ApplicationInformation.ApplicationName + ". você pode agora utilizar sem problemas.";
            //}

            //if (evt is AccountClosedEvent<CustomUserAccount>)
            //{
            //    return FormatValue(evt, "sua conta foi emcerrada pelo {applicationName}. ", values);
            //}

            return base.GetBody(evt, values);
        }
    }

    public class CustomClaimsMapper : ICommandHandler<MapClaimsFromAccount<CustomUserAccount>>
    {
        public void Handle(MapClaimsFromAccount<CustomUserAccount> cmd)
        {
            cmd.MappedClaims = new System.Security.Claims.Claim[]
            {
                new System.Security.Claims.Claim(ClaimTypes.Actor, cmd.Account.FirstName + " " + cmd.Account.LastName),
                new System.Security.Claims.Claim(ClaimTypes.GivenName, cmd.Account.FirstName),
                new System.Security.Claims.Claim(ClaimTypes.Surname, cmd.Account.LastName),
                new System.Security.Claims.Claim(ClaimTypes.GroupSid, cmd.Account.Inscription.ToString()),
                new System.Security.Claims.Claim(ClaimTypes.PrimaryGroupSid, cmd.Account.Source.ToString()),
            };
        }
    }


    public class CustomValidationMessages : ICommandHandler<GetValidationMessage>
    {
        public void Handle(GetValidationMessage cmd)
        {
            if (cmd.ID == MembershipRebootConstants.ValidationMessages.UsernameRequired)
            {
                cmd.Message = "usuário requerido!";
            }
        }
    }

    public class Configuration : System.Data.Entity.Migrations.DbMigrationsConfiguration<CustomDatabase>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = true;
            AutomaticMigrationDataLossAllowed = true;
        }

        protected override void Seed(CustomDatabase context)
        {
        }
    }
}