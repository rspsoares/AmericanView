using System;
using System.Collections.Generic;
using System.Configuration;
using System.Web;
using System.Web.Mvc;
using Keeptrue.Conciliador.View.Authorization;
using Keeptrue.Conciliador.Permissoes.Domain.Entities;
using System.Collections;
using Newtonsoft.Json;
using System.IO;
using Keeptrue.Conciliador.UI.Application.Bindings;
using Keeptrue.Conciliador.View.Models;
using Keeptrue.Conciliador.Comum.Application;
using Keeptrue.Conciliador.UI.Application.Contracts;
using Keeptrue.Conciliador.Permissoes.Application.Contracts;
using Keeptrue.Conciliador.Permissoes.Application.Bindings;
using Keeptrue.Conciliador.UI.Application.Dto;
using Keeptrue.Conciliador.Comum.Application.Bindings;
using Keeptrue.Conciliador.Comum.Application.Contracts;
using Keeptrue.Conciliador.Relatorios.Application.Dto;
using Keeptrue.Conciliador.Apuracoes.Application.Contracts;
using Keeptrue.Conciliador.Apuracoes.Application.Contracts.Dto;

namespace Keeptrue.Conciliador.View.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        private AuthorizationHelper claimHelper = new AuthorizationHelper();
        private UsuarioLogado usuarioLogado = new UsuarioLogado();
        private IImportacaoFacade _importacaoFacade;
        private IConversoresFacade _conversorFacade;
        private ISaldoFacade _saldoFacade;
        private IDashBoardFacade _dash;
        private IFechamentoFacade _fechamentoFacade;

        public HomeController(IImportacaoFacade importacaoFacade, IConversoresFacade conversorFacade, ISaldoFacade saldoFacade, IDashBoardFacade dashboard, IFechamentoFacade fechamentoFacade)
        {            
            usuarioLogado = claimHelper.ObterUsuarioLogado();
            _importacaoFacade = importacaoFacade;
            _conversorFacade = conversorFacade;
            _saldoFacade = saldoFacade;
            _dash = dashboard;
            _fechamentoFacade = fechamentoFacade;
        }

        [AuthorizeUser(AccessLevel = "/Home")]
        public ActionResult Index()
        {
            ViewBag.NomeUsuario = usuarioLogado.Nome;
            return View();
        }

        public JsonResult PesquisarImportacoes()
        {
            string msgErro = string.Empty;
            List<ImportacaoDto> lstImportacoes = _importacaoFacade.PesquisarImportacoes(out msgErro);

            if (!string.IsNullOrEmpty(msgErro))
                return Json(new { Sucesso = false, Data = "", Total = "", Msg = "Houve um erro ao obter as Importações." }, JsonRequestBehavior.AllowGet);
            else
                return Json(new { Sucesso = true, Data = lstImportacoes, Total = lstImportacoes.Count, Msg = string.Empty }, JsonRequestBehavior.AllowGet);
        }

        public JsonResult VerificarArquivoImportacoes()
        {
            string msgErro = string.Empty;
            string pastaPendentes = ConfigurationManager.AppSettings["PastaPendentes"];
            
            string msgRetorno = _importacaoFacade.VerificarArquivoImportacoes(pastaPendentes, "3224", "FAGLB03", out msgErro);
                        
            if (!string.IsNullOrEmpty(msgErro))
                return Json(new { Sucesso = false, Msg = "Houve um erro ao obter as Importações: " + msgErro }, JsonRequestBehavior.AllowGet);
            else
                return Json(new { Sucesso = true, Msg = msgRetorno }, JsonRequestBehavior.AllowGet);
        }

        public string PesquisarInscricoes()
        {
            CadastrosFacade _cadastro = new CadastrosFacade();
            string msg = string.Empty;

            List<InscricoesCompletaDto> lstInscricoes = _cadastro.RetornarInscricoesCompletas(0, out msg);

            if (msg != string.Empty)
                return JsonConvert.SerializeObject("MSG: Ocorreu um erro ao obter as Inscrições.");
            else
                return JsonConvert.SerializeObject(lstInscricoes);
        }

        public JsonResult PesquisarSaldos()
        {
            ResumoSaldoGraficoDto saldo = new ResumoSaldoGraficoDto();
            string msgErro = string.Empty;

            saldo = _saldoFacade.RetornarSaldosGrafico(1, out msgErro);

            if (!string.IsNullOrEmpty(msgErro))
                return Json(new { Sucesso = false, Data = "", Msg = "Houve um erro ao obter os Saldos." }, JsonRequestBehavior.AllowGet);
            else
                return Json(new { Sucesso = true, Data = saldo, Msg = string.Empty }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult RecuperarHistorico()
        {
            List<HistoricoDto> retorno = new List<HistoricoDto>();
            retorno = _dash.RecuperarHistoricos();
            return Json(new { Sucesso = true, Data = retorno, Total = retorno.Count, Msg = string.Empty }, JsonRequestBehavior.AllowGet);            
        }

        public JsonResult GerarPDF(string html, bool orientacaoPaisagem)
        {
            MemoryStream mStreamPDF = new MemoryStream();
            WebHelper helper = new WebHelper();
            string nomeArquivo = string.Empty;
            string pasta = string.Empty;
            string linkPDF = string.Empty;
            string msgErro = string.Empty;

            pasta = Server.MapPath("~/ExportacaoPDF/");
            nomeArquivo = "Mosaic_" + DateTime.Now.ToString("yyyy-MM-dd_HH-mm-ss") + ".pdf";

            mStreamPDF = _conversorFacade.HTML2PDF(html, Properties.Resources.eoPDFLicense, pasta, orientacaoPaisagem);

            if (mStreamPDF.Length > 0 && helper.GravarArquivo(pasta, nomeArquivo, mStreamPDF, out msgErro))
            {
                linkPDF = string.Format("../{0}/{1}", "ExportacaoPDF", nomeArquivo);
                return Json(new { Sucesso = true, Link = linkPDF, Msg = string.Empty }, JsonRequestBehavior.AllowGet);
            }
            else
                return Json(new { Sucesso = false, Link = "", Msg = "Houve um erro ao gerar o arquivo PDF: " + msgErro }, JsonRequestBehavior.AllowGet);                
        }

        [HttpGet]
        public JsonResult RecuperarPeriodosAbertos()
        {
            string msgErro;
            List<FechamentoDto> lstFechamentos = _fechamentoFacade.ObterFechamentosAbertos(out msgErro);

            if (!string.IsNullOrEmpty(msgErro))
                return Json(new { Sucesso = false, Data = "", Total = "", Msg = "Houve um erro ao obter os períodos abertos." }, JsonRequestBehavior.AllowGet);
            else
                return Json(new { Sucesso = true, Data = lstFechamentos, Total = lstFechamentos.Count, Msg = string.Empty }, JsonRequestBehavior.AllowGet);
        }
    }
}
