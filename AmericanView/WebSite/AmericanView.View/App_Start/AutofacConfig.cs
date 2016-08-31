using AmericanView.View.Models;
using System.Reflection;
using System.Web.Mvc;
using Autofac;
using Autofac.Integration.Mvc;
using BrockAllen.MembershipReboot;
using BrockAllen.MembershipReboot.Ef;
using BrockAllen.MembershipReboot.WebHost;

namespace AmericanView.View
{
    public class AutofacConfig
    {
        public static void ConfigureContainer()
        {
            var config = App_Start.MembershipRebootConfiguration.Create();
            var builder = new ContainerBuilder();
            builder.RegisterControllers(Assembly.GetAssembly(typeof(AutofacConfig)));

            #region MembershipReboot
            builder.RegisterInstance(config).As<MembershipRebootConfiguration<CustomUserAccount>>();
            builder.RegisterType<SamAuthenticationService<CustomUserAccount>>().As<AuthenticationService<CustomUserAccount>>().InstancePerLifetimeScope();
            builder.RegisterType<UserAccountService<CustomUserAccount>>().AsSelf().InstancePerLifetimeScope();
            builder.RegisterType<CustomRepository>()
                .As<IUserAccountRepository<CustomUserAccount>>()
                .As<IUserAccountQuery>()
                .InstancePerLifetimeScope();

            builder.RegisterType<DefaultGroupRepository>()
                .As<IGroupRepository>()
                .As<IGroupQuery>()
                .InstancePerLifetimeScope();
            builder.RegisterType<GroupService>().AsSelf().InstancePerLifetimeScope();
            #endregion

            //builder.RegisterType<CadastrosFacade>().As<ICadastrosFacade>().InstancePerLifetimeScope();
            //builder.RegisterType<ParametrizacaoFacade>().As<IParametrizacaoFacade>().InstancePerLifetimeScope();
            //builder.RegisterType<UsuarioUIDevolucaoFacade>().As<IUsuarioUIDevolucaoFacade>().InstancePerLifetimeScope();
            //builder.RegisterType<GruposUIFacade>().As<IGruposUIFacade>().InstancePerLifetimeScope();
            //builder.RegisterType<EmpresaFacade>().As<IEmpresaFacade>().InstancePerLifetimeScope();
            //builder.RegisterType<LogManualEntriesFacade>().As<ILogManualEntriesFacade>().InstancePerLifetimeScope();
            //builder.RegisterType<ResultadosValidacoesFacade>().As<IResultadosValidacoesFacade>().InstancePerLifetimeScope();
            //builder.RegisterType<ControleValidacoes>().As<IControleValidacoes>().InstancePerLifetimeScope();
            //builder.RegisterType<DocumentosFiscaisFacade>().As<IDocumentosFiscaisFacade>().InstancePerLifetimeScope();
            //builder.RegisterType<DadosAuxiliares>().As<IDadosAuxiliares>().InstancePerLifetimeScope();
            //builder.RegisterType<ImportacaoFacade>().As<IImportacaoFacade>().InstancePerLifetimeScope();
            //builder.RegisterType<ConversoresFacade>().As<IConversoresFacade>().InstancePerLifetimeScope();
            //builder.RegisterType<SaldoFacade>().As<ISaldoFacade>().InstancePerLifetimeScope();
            //builder.RegisterType<ConciliacaoContabilFacade>().As<IConciliacaoContabilFacade>().InstancePerLifetimeScope();
            //builder.RegisterType<HistoricoFacade>().As<IDashBoardFacade>().InstancePerLifetimeScope();
            //builder.RegisterType<SaldosIniciaisFacade>().As<ISaldosIniciaisFacade>().InstancePerLifetimeScope();

            #region Apurações
            //builder.RegisterType<FechamentoFacade>().As<IFechamentoFacade>().InstancePerLifetimeScope();
            //builder.RegisterType<FechamentoLogFacade>().As<IFechamentoLogFacade>().InstancePerLifetimeScope();
            #endregion Apurações

            #region Permissoes
            //builder.RegisterType<GruposFacade>().As<IGruposFacade>().InstancePerRequest();
            //builder.RegisterType<PermissoesFacade>().As<IPermissoesFacade>().InstancePerRequest();
            //builder.RegisterType<PerfilFacade>().As<IPerfilFacade>().InstancePerRequest();
            //builder.RegisterType<LogFacade>().As<ILogFacade>().InstancePerLifetimeScope();
            #endregion

            #region Relatórios & Regras
            //builder.RegisterType<RegrasFacade>().As<IRegrasFacade>().InstancePerLifetimeScope();
            //builder.RegisterType<RelatorioAnaliticoFacade>().As<IRelatorioAnaliticoFacade>().InstancePerLifetimeScope();
            //builder.RegisterType<EntradaManualFacade>().As<IEntradaManualFacade>().InstancePerLifetimeScope();
            //builder.RegisterType<GerencialCreditoFacade>().As<IGerencialCreditoFacade>().InstancePerLifetimeScope();
            //builder.RegisterType<GerencialAjustesFacade>().As<IGerencialAjustesFacade>().InstancePerLifetimeScope();
            //builder.RegisterType<GerencialReceitasFacade>().As<IGerencialReceitasFacade>().InstancePerLifetimeScope();
            //builder.RegisterType<ResultadosSaldosFacade>().As<IResultadosSaldosFacade>().InstancePerLifetimeScope();

            #endregion

            #region Cruzamento
            //builder.RegisterType<TCDControleFacade>().As<ITCDControleFacade>().InstancePerLifetimeScope();
            //builder.RegisterType<TCDControleLogFacade>().As<ITCDControleLogFacade>().InstancePerLifetimeScope();

            //builder.RegisterType<TAuRegraCruzamentoConfigColunasFacade>().As<ITAuRegraCruzamentoConfigColunasFacade>().InstancePerLifetimeScope();
            //builder.RegisterType<TAuRegraCruzamentoFacade>().As<ITAuRegraCruzamentoFacade>().InstancePerLifetimeScope();
            //builder.RegisterType<TAuRegraCruzamentoResultadoFacade>().As<ITAuRegraCruzamentoResultadoFacade>().InstancePerLifetimeScope();
            #endregion

            #region COMMON
            //builder.RegisterType<JobFacade>().As<IJobFacade>().InstancePerLifetimeScope();
            #endregion COMMON

            var container = builder.Build();
            DependencyResolver.SetResolver(new AutofacDependencyResolver(container));
        }
    }
}