using Keeptrue.Conciliador.View.Models;
using Keeptrue.Conciliador.View.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Keeptrue.Conciliador.View.Controllers
{
    [AllowAnonymous]
    public class SemAutorizacaoController : Controller
    {
        private UsuarioLogado usuarioLogado = new UsuarioLogado();
        private AuthorizationHelper claimHelper = new AuthorizationHelper();

        public SemAutorizacaoController()
        {
            usuarioLogado = claimHelper.ObterUsuarioLogado(false);
        }

        //
        // GET: /SemAutorizacao/

        public ActionResult Index()
        {
            ViewBag.NomeUsuario = usuarioLogado.Nome;
            return View();
        }

        [Authorize]
        public ActionResult Interno()
        {
            return View();
        }
    }
}
