using System;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace Keeptrue.Conciliador.View.Authorization
{
    public class AuthorizeUserAttribute : AuthorizeAttribute
    {
        private string _access;
        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            AuthorizationRepository authService = new AuthorizationRepository();
            var isAuthorized = base.AuthorizeCore(httpContext);
            if (!isAuthorized)
            {
                return false;
            }

            System.Security.Claims.ClaimsPrincipal principal = HttpContext.Current.User as System.Security.Claims.ClaimsPrincipal;
            if(null != principal)
            {
                System.Security.Claims.Claim uqUsuario = (from c in principal.Claims where c.Type.Equals(@"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier") select c).SingleOrDefault<System.Security.Claims.Claim>();
                string privilegeLevels = authService.BuscarPermissoes(uqUsuario.Value, httpContext);

                if (privilegeLevels.Contains(this.AccessLevel))
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            return false;
        }

        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            if (filterContext.HttpContext.User.Identity.IsAuthenticated)
            {
                //base.HandleUnauthorizedRequest(filterContext);
                filterContext.Result = new RedirectToRouteResult(new
                        RouteValueDictionary(new { controller = "SemAutorizacao", action = "Index" }));
            }
            else
            {
                filterContext.Result = new RedirectToRouteResult(new
                RouteValueDictionary(new { controller = "SemAutorizacao", action = "Index" }));
            }
        }

        public string AccessLevel
        {
            get
            {
                return (this._access ?? string.Empty);
            }
            set
            {
                this._access = value;
            }
        }
    }
}