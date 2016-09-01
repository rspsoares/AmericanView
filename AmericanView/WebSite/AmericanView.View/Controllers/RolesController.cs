using System;
using System.Linq;
using System.Web.Mvc;
using AmericanView.View.Authorization;
using System.Text;
using AmericanView.Permissoes.Application.Contracts;
using AmericanView.View.Models;
using AmericanView.Permissoes.Application.Bindings;

namespace AmericanView.View.Controllers
{
    [Authorize]
    public class RolesController : Controller
    {
        IPermissoesFacade _permFacade = new PermissoesFacade();
        private AuthorizationHelper claimHelper = new AuthorizationHelper();
        private UsuarioLogado usuarioLogado = new UsuarioLogado();

        public RolesController()
        {            
            usuarioLogado = claimHelper.ObterUsuarioLogado(false);
        }

        //
        // GET: /Roles/
        [AuthorizeUser(AccessLevel = "/Roles")]
        public ActionResult Index()
        {
            ViewBag.NomeUsuario = usuarioLogado.Nome;
            return View();
        }

        public string MenuLateral()
        {
            string uqUsuario = string.Empty;
            System.Security.Claims.ClaimsPrincipal principal =  System.Web.HttpContext.Current.User as System.Security.Claims.ClaimsPrincipal;
            if (null != principal)
            {
                System.Security.Claims.Claim usuario = (from c in principal.Claims where c.Type.Equals(@"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier") select c).SingleOrDefault<System.Security.Claims.Claim>();
                uqUsuario = usuario.Value;
            }

            var cacheResult = HttpContext.Cache.Get(uqUsuario);
            if (cacheResult == null)
            {
                var resultados = _permFacade.BuscarPermissoes(uqUsuario);
                HttpContext.Cache.Add(uqUsuario, resultados, null, DateTime.Now.AddMinutes(30), System.Web.Caching.Cache.NoSlidingExpiration, System.Web.Caching.CacheItemPriority.Default, null);
                return MontarMenu(resultados);
            }
            else
                return MontarMenu(cacheResult.ToString());
        }      

        private string MontarMenu(string permissoes)
        {
            StringBuilder menu = new StringBuilder();
            menu.Append("[");
            menu.Append(Menu_lateral.dashboard + ",");

            menu.Append(VerificarPermissaoItemMenu(Menu_lateral.home, permissoes.Contains("/Home")));
           // menu.Append(",");
         //   menu.Append(VerificarPermissaoItemMenu(Menu_lateral.documentosfiscais, permissoes.Contains("/Home")));


            if (permissoes.Contains("/Analises"))
            {
                menu.Append(",");
                menu.Append(Menu_lateral.analises);
                menu.Append(VerificarPermissaoItemMenu(Menu_lateral.validacoes, permissoes.Contains("/Analises")) + ",");
                menu.Append(VerificarPermissaoItemMenu(Menu_lateral.relatorios, permissoes.Contains("/Analises")) + ",");
                menu.Append(VerificarPermissaoItemMenu(Menu_lateral.InsercaoSaldos, permissoes.Contains("/Analises")));
                menu.Append("]}");
            }

            if (permissoes.Contains("/Cruzamentos"))
            {
                menu.Append(",");
                menu.Append(Menu_lateral.cruzamentos);
                menu.Append(VerificarPermissaoItemMenu(Menu_lateral.cruzcarga, permissoes.Contains("/Cruzamentos")) + ",");
                menu.Append(VerificarPermissaoItemMenu(Menu_lateral.cruztarefa, permissoes.Contains("/Cruzamentos")) + ",");
                menu.Append(VerificarPermissaoItemMenu(Menu_lateral.cruzlogs, permissoes.Contains("/Cruzamentos")));
                menu.Append("]}");
            }

            if (permissoes.Contains("/Configuracoes"))
            {
                menu.Append(",");
                menu.Append(Menu_lateral.configuracoes);
                menu.Append(VerificarPermissaoItemMenu(Menu_lateral.saldosiniciais, permissoes.Contains("/Configuracoes")) + ",");
                menu.Append(VerificarPermissaoItemMenu(Menu_lateral.fechamentos, permissoes.Contains("/Configuracoes")) + ",");
                menu.Append(VerificarPermissaoItemMenu(Menu_lateral.configApurRec, permissoes.Contains("/Configuracoes")) + ",");
                menu.Append(VerificarPermissaoItemMenu(Menu_lateral.configApurCred, permissoes.Contains("/Configuracoes")) + ",");
                menu.Append(VerificarPermissaoItemMenu(Menu_lateral.configLogs, permissoes.Contains("/Configuracoes")));
                menu.Append("]}");
            }

            if (permissoes.Contains("/Cadastros"))
            {
                menu.Append(",");
                menu.Append(Menu_lateral.cadastros);
                menu.Append(VerificarPermissaoItemMenu(Menu_lateral.cadmatriz, permissoes.Contains("/Cadastros")) + ",");
                menu.Append(VerificarPermissaoItemMenu(Menu_lateral.cadusuarios, permissoes.Contains("/Cadastros")));
                menu.Append("]}");
            }

            if (permissoes.Contains("/Sistema"))
            {
                menu.Append(",");
                menu.Append(Menu_lateral.sistema);
                menu.Append(VerificarPermissaoItemMenu(Menu_lateral.sisconfiggeral, permissoes.Contains("/Sistema")));
                menu.Append("]}");
            }

            menu.Append("]");

            return menu.ToString();
        }

        private string VerificarPermissaoItemMenu(string item, bool exibirItem)
        {
            string itemMenu = string.Empty;
            
            itemMenu = exibirItem == true ? item : item.Replace("true", "false");

            return itemMenu;
        }
    }
}
