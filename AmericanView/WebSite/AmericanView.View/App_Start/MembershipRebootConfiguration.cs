using BrockAllen.MembershipReboot;
using BrockAllen.MembershipReboot.WebHost;
using AmericanView.View.Models;

namespace AmericanView.View.App_Start
{
    public class MembershipRebootConfiguration
    {
        public static MembershipRebootConfiguration<CustomUserAccount> Create()
        {
            var settings = SecuritySettings.Instance;
            settings.MultiTenant = false;

            var config = new MembershipRebootConfiguration<CustomUserAccount>(settings);
            config.AddEventHandler(new DebuggerEventHandler<CustomUserAccount>());

            config.RegisterPasswordValidator(new PasswordValidator());
            config.ConfigurePasswordComplexity(8, 3);

            config.AddCommandHandler(new CustomClaimsMapper());

            var appinfo = new AspNetApplicationInformation("Portal de Apuração de Tributos", "Mosaic",
                "/Login",
                "/Registrar/Confirm/",
                "/Login/Cancel/",
                "/Login/Confirm/");
            var emailFormatter = new CustomEmailMessageFormatter(appinfo);
            // uncomment if you want email notifications -- also update smtp settings in web.config
            config.AddEventHandler(new EmailAccountEventsHandler<CustomUserAccount>(emailFormatter));


            config.AddEventHandler(new AuthenticationAuditEventHandler());
            config.AddEventHandler(new NotifyAccountOwnerWhenTooManyFailedLoginAttempts());
            config.AddValidationHandler(new PasswordChanging());
            config.AddEventHandler(new PasswordChanged());
            config.AddCommandHandler(new CustomValidationMessages());

            // uncomment to enable SMS notifications -- also update TwilloSmsEventHandler class below
            //config.AddEventHandler(new TwilloSmsEventHandler(appinfo));

            // uncomment to ensure proper password complexity
            //config.ConfigurePasswordComplexity();

            var debugging = false;
#if DEBUG
            debugging = true;
#endif
            // this config enables cookies to be issued once user logs in with mobile code
            config.ConfigureTwoFactorAuthenticationCookies(debugging);

            return config;
        }
    }
}