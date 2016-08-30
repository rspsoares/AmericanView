using System.Web.Mvc;

namespace AmericanView.View.Controllers
{
    [Authorize]
    public class ValoresManuaisController : Controller
    {
        //private AuthorizationHelper claimHelper = new AuthorizationHelper();
        //private UsuarioLogado usuarioLogado = new UsuarioLogado();
        //private IEntradaManualFacade _manualEntriesFacade;
        //private ILogManualEntriesFacade _logManualEntriesFacade;      

        //public ValoresManuaisController(IEntradaManualFacade manualEntriesFacade, ILogManualEntriesFacade logManualEntriesFacade)
        //{
        //    usuarioLogado = claimHelper.ObterUsuarioLogado();
        //    _manualEntriesFacade = manualEntriesFacade;
        //    _logManualEntriesFacade = logManualEntriesFacade;    
        //}

        //[AuthorizeUser(AccessLevel = "/Analise")]
        //public ActionResult Index()
        //{
        //    ViewBag.NomeUsuario = usuarioLogado.Nome;
        //    return View();
        //}

        //[HttpGet]
        //public JsonResult Pesquisar(int idMatriz)
        //{
        //    string msg;
        //    List<EntradaManualDto> res = _manualEntriesFacade.GetManualEntries(idMatriz, usuarioLogado.uqUsuario, out msg);

        //    if (!string.IsNullOrEmpty(msg))
        //        return Json(msg, JsonRequestBehavior.AllowGet);
        //    else
        //        return Json(res, JsonRequestBehavior.AllowGet);
        //}

        //[HttpGet]
        //public JsonResult ObterLog(int idLancamento)
        //{
        //    string msg;

        //    List<LogManualEntriesDto> lstLog = _logManualEntriesFacade.GetLogManualEntries(idLancamento, out msg);

        //    if (!string.IsNullOrEmpty(msg))
        //        return Json(new { Sucesso = false, Data = "", Msg = "Houve um erro ao obter o Log de alterações deste lançamento." }, JsonRequestBehavior.AllowGet);
        //    else
        //        return Json(new { Sucesso = true, Data = lstLog, Msg = string.Empty }, JsonRequestBehavior.AllowGet);
        //}

        //[HttpPost]
        //public JsonResult Alterar(EntradaManualDto lancamentoOriginal, EntradaManualDto lancamentoAlterado)
        //{
        //    string msg = string.Empty;
          
        //    _manualEntriesFacade.UpdateManualEntries(lancamentoAlterado, lancamentoOriginal, usuarioLogado.uqUsuario, out msg);

        //    if (msg != string.Empty)
        //        return Json(new { Sucesso = false, Msg = msg }, JsonRequestBehavior.AllowGet);
        //    else
        //        return Json(new { Sucesso = true, Msg = "Lançamento alterado com sucesso." }, JsonRequestBehavior.AllowGet);
        //}
    }
}
