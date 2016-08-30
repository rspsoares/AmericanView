using System;
using System.Linq;
using System.Security.Claims;
using System.Web;
using AmericanView.View.Models;

namespace AmericanView.View.Authorization
{
    public class AuthorizationHelper
    {
        public UsuarioLogado ObterUsuarioLogado(bool obterCNPJs = true)
        {
            string msgErro = string.Empty;
            UsuarioLogado usuarioLogado = new UsuarioLogado();

            ClaimsPrincipal principal = HttpContext.Current.User as ClaimsPrincipal;

            if (null != principal && principal.Identity.IsAuthenticated)
            {
                Claim login = (from c in principal.Claims where c.Type.Equals(@"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name") select c).SingleOrDefault<System.Security.Claims.Claim>();
                usuarioLogado.Login = login.Value;

                Claim guid = (from c in principal.Claims where c.Type.Equals(@"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier") select c).SingleOrDefault<System.Security.Claims.Claim>();
                usuarioLogado.uqUsuario = new Guid(guid.Value);

                Claim usuarioEmail = (from c in principal.Claims where c.Type.Equals(@"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress") select c).SingleOrDefault<System.Security.Claims.Claim>();
                usuarioLogado.Email = usuarioEmail.Value;

                Claim grupoPrimario = (from c in principal.Claims where c.Type.Equals(@"http://schemas.microsoft.com/ws/2008/06/identity/claims/primarygroupsid") select c).SingleOrDefault<System.Security.Claims.Claim>();
                if (grupoPrimario != null)
                    usuarioLogado.Origem = (TipoUsuario)System.Enum.Parse(typeof(TipoUsuario), grupoPrimario.Value);

                Claim grupoSecundario = (from c in principal.Claims where c.Type.Equals(@"http://schemas.microsoft.com/ws/2008/06/identity/claims/groupsid") select c).SingleOrDefault<System.Security.Claims.Claim>();
                if (grupoSecundario != null)
                    usuarioLogado.Inscricao = int.Parse(grupoSecundario.Value);

                //if (System.Web.HttpContext.Current.Session["idUsuarioLogado"] == null || int.Parse(System.Web.HttpContext.Current.Session["idUsuarioLogado"].ToString()) == 0)
                //    System.Web.HttpContext.Current.Session["idUsuarioLogado"] = _usuario.RetornarIDUsuario(usuarioLogado.uqUsuario.ToString());

                //usuarioLogado.idUsuario = int.Parse(System.Web.HttpContext.Current.Session["idUsuarioLogado"].ToString());

                Claim usuarioNome = (from c in principal.Claims where c.Type.Equals(@"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname") select c).SingleOrDefault<System.Security.Claims.Claim>();
                usuarioLogado.Nome = usuarioNome.Value;

                System.Web.HttpContext.Current.Session["SessaoExpirada"] = null;
            }

            return usuarioLogado;
        }
    }
}