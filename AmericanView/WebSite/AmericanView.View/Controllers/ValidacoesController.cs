using System.Web.Mvc;

namespace AmericanView.View.Controllers
{
    public class ValidacoesController : Controller
    {
        //private AuthorizationHelper claimHelper = new AuthorizationHelper();
        //private UsuarioLogado usuarioLogado = new UsuarioLogado();
        //private IResultadosValidacoesFacade _resultadosFacade;
        //private IControleValidacoes _controleFacade;
        //private IDocumentosFiscaisFacade _documentoFacade;
        //private IDadosAuxiliares _dadosAuxiliares;

        //public ValidacoesController(IResultadosValidacoesFacade resultadosFacade, IControleValidacoes controleFacade, IDocumentosFiscaisFacade documentoFacade, IDadosAuxiliares dadosAuxiliares)
        //{
        //    usuarioLogado = claimHelper.ObterUsuarioLogado();
        //    _resultadosFacade = resultadosFacade;
        //    _controleFacade = controleFacade;
        //    _documentoFacade = documentoFacade;
        //    _dadosAuxiliares = dadosAuxiliares;
        //}

        //public ActionResult Index()
        //{
        //    ViewBag.NomeUsuario = usuarioLogado.Nome;
        //    return View();
        //}

        //public JsonResult PesquisarValidacoes(int idMatriz)
        //{
        //    string msg;
        //    List<ValidacaoDTO> lstValidacoes = _resultadosFacade.BuscarValidacoes(idMatriz, out msg);

        //    if (!string.IsNullOrEmpty(msg))
        //        return Json(new { Sucesso = false, Data = "", Total = 0 , Msg = "Houve um erro ao obter as Validações."}, JsonRequestBehavior.AllowGet);                
        //    else
        //        return Json(new { Sucesso = true, Data = lstValidacoes, Total = lstValidacoes.Count, Msg = string.Empty }, JsonRequestBehavior.AllowGet);
        //}

        //public JsonResult PesquisarResultados(int idValidacao)
        //{
        //    string msg;
        //    List<SumarioValidacoesDTO> lstResultados = _resultadosFacade.BuscarSumario(idValidacao, out msg);

        //    if (!string.IsNullOrEmpty(msg))
        //        return Json(new { Sucesso = false, Data = "", Msg = "Houve um erro ao obter os Resultados da Validação." }, JsonRequestBehavior.AllowGet);
        //    else
        //        return Json(new { Sucesso = true, Data = lstResultados, Msg = string.Empty }, JsonRequestBehavior.AllowGet);
        //}

        //public JsonResult PesquisarSumariosPorPeriodo(int idTnaControle)
        //{
        //    List<SumarioValidacoesDTO> lstResultados = _resultadosFacade.BuscarSumarioPeriodo(idTnaControle);
        //    return Json(new { Sucesso = true, Data = lstResultados, Msg = string.Empty }, JsonRequestBehavior.AllowGet);
        //}
       
        //public JsonResult RevalidarPeriodo(int idMatriz, int idValidacao)
        //{
        //    string msg;
        //    ValidacaoDTO validacao = _resultadosFacade.BuscarValidacoes(idMatriz, out msg).Where(x => x.Id == idValidacao).FirstOrDefault();

        //    if (!string.IsNullOrEmpty(msg))
        //        return Json(new { Sucesso = false, Data = "", Msg = "Houve um erro ao obter a Validação." }, JsonRequestBehavior.AllowGet);

        //    _controleFacade.AlterarValidacao(validacao, AmericanView.Conciliador.Enum.Validacoes.StatusExecucao.Aguardando, out msg);

        //    if (!string.IsNullOrEmpty(msg))
        //        return Json(new { Sucesso = false, Msg = "Houve um erro ao obter os Resultados da Validação." }, JsonRequestBehavior.AllowGet);
        //    else
        //        return Json(new { Sucesso = true, Msg = "Revalidação do Período solicitada com sucesso." }, JsonRequestBehavior.AllowGet);
        //}

        //public JsonResult PesquisarDetalhamentoSumario(int idSumario)
        //{
        //    List<DocumentoFiscalDTO> notasSumario = new List<DocumentoFiscalDTO>();
        //    JsonResult result = new JsonResult();
        //    string msgErro = string.Empty;

        //    notasSumario = _resultadosFacade.BuscarDocumentosFiscaisSumario(idSumario, out msgErro);

        //    if (string.IsNullOrEmpty(msgErro))
        //    {
        //        result = Json(new
        //        {
        //            Sucesso = true,
        //            Data = notasSumario,                 
        //            Msg = string.Empty
        //        }, JsonRequestBehavior.AllowGet);

        //        result.MaxJsonLength = int.MaxValue;
        //    }
        //    else
        //        result = Json(new
        //        {
        //            Sucesso = false,
        //            Data = "",                    
        //            Msg = "Houve um erro ao obter os Documentos Fiscais pelo Sumário."
        //        }, JsonRequestBehavior.AllowGet);

        //    return result;         
        //}

        //public JsonResult PesquisarDetalhamentoNotaFiscalPorRegra(int idRegra)
        //{
        //    List<DocumentoFiscalDTO> notasRegra = new List<DocumentoFiscalDTO>(); 
        //    JsonResult result = new JsonResult();
        //    string msgErro = string.Empty;

        //    notasRegra = _resultadosFacade.BuscarDocumentosFiscaisPorRegra(idRegra, out msgErro);

        //    if (string.IsNullOrEmpty(msgErro))
        //    {
        //        result = Json(new
        //        {
        //            Sucesso = true,
        //            Data = notasRegra,
        //            Msg = string.Empty
        //        }, JsonRequestBehavior.AllowGet);

        //        result.MaxJsonLength = int.MaxValue;
        //    }
        //    else
        //        result = Json(new
        //        {
        //            Sucesso = false,
        //            Data = "",
        //            Msg = "Houve um erro ao obter os Documentos Fiscais pela Regra."
        //        }, JsonRequestBehavior.AllowGet);

        //    return result;         
        //}

        //public JsonResult PesquisarDetalhamentoNotaFiscal(int idNotaFiscal)
        //{
        //    DocumentoFiscalDTO notaFiscal = new DocumentoFiscalDTO();
        //    string msgErro = string.Empty;
            
        //    DetalheNotaValidacoesDTO validacaoNotaFiscal = _resultadosFacade.BuscarDetalhesNota(idNotaFiscal, out msgErro);                        

        //    notaFiscal = validacaoNotaFiscal.Documento;
        //    notaFiscal.Editavel = _documentoFacade.VerificarDocumentoFiscalEditavel(notaFiscal.Id, out msgErro);

        //    if (!string.IsNullOrEmpty(msgErro))
        //        return Json(new { Sucesso = false, Regras = "", NotaFiscal = "", Msg = "Houve um erro ao obter os Detalhes por Nota Fiscal." }, JsonRequestBehavior.AllowGet);
        //    else
        //        return Json(new { Sucesso = true, Regras = validacaoNotaFiscal.Regras, NotaFiscal = notaFiscal, Msg = string.Empty }, JsonRequestBehavior.AllowGet);
        //}

        //[HttpPost]
        //public JsonResult SalvarNotaFiscal(int idDocumentoFiscal, int idCategoria)
        //{            
        //    string msgErro = string.Empty;

        //    _documentoFacade.AtualizarDocumentoCategoria(idDocumentoFiscal, idCategoria, usuarioLogado.uqUsuario, out msgErro);

        //    if (!string.IsNullOrEmpty(msgErro))
        //        return Json(new { Sucesso = false, Msg = "Houve um erro ao alterar a Categoria da Nota Fiscal." }, JsonRequestBehavior.AllowGet);
        //    else
        //        return Json(new { Sucesso = true, Msg = "Categoria da Nota Fiscal alterada com sucesso." }, JsonRequestBehavior.AllowGet);
        //}

        //public JsonResult BuscarCategoriasNotaFiscal()
        //{
        //    string msg;

        //    List<CategoriaDTO> lstCategorias = _dadosAuxiliares.RecuperarTodasCategorias(out msg);

        //    foreach (CategoriaDTO itemCategoria in lstCategorias)            
        //        itemCategoria.Descricao = string.Format("{0} - {1}", itemCategoria.Codigo, itemCategoria.Descricao);
            
        //    if (!string.IsNullOrEmpty(msg))
        //        return Json(new { Sucesso = false, Data = "", Msg = "Houve um erro ao obter os Detalhes por Nota Fiscal." }, JsonRequestBehavior.AllowGet);
        //    else
        //        return Json(new { Sucesso = true, Data = lstCategorias, Msg = string.Empty }, JsonRequestBehavior.AllowGet);
        //}

        //[HttpPost]
        //public JsonResult SalvarItemNotaFiscal(DocumentoFiscalItemDTO itemNotaFiscal)
        //{
        //    string msgErro = string.Empty;

        //    _documentoFacade.AtualizarItem(itemNotaFiscal, usuarioLogado.uqUsuario, out msgErro);

        //    if (!string.IsNullOrEmpty(msgErro))
        //        return Json(new { Sucesso = false, Msg = msgErro }, JsonRequestBehavior.AllowGet);
        //    else
        //        return Json(new { Sucesso = true, Msg = "Item da Nota Fiscal alterado com sucesso." }, JsonRequestBehavior.AllowGet);
        //}

        //[HttpPost]
        //public JsonResult Revalidar(int idValidacao)
        //{
        //    string msgErro = string.Empty;

        //    _controleFacade.AlterarValidacaoRevalidar(idValidacao, usuarioLogado.uqUsuario, out msgErro);

        //    if (!string.IsNullOrEmpty(msgErro))
        //        return Json(new { Sucesso = false, Msg = "Ocorreu um erro ao solicitar a revalidação." }, JsonRequestBehavior.AllowGet);
        //    else
        //        return Json(new { Sucesso = true, Msg = "Revalidação solicitada com sucesso." }, JsonRequestBehavior.AllowGet);
        //}
    }
}
