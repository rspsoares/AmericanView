var idMatriz = 0;
var objFechamento;

function CarregarComponentes() {
    CarregarMatrizes();

    $('#btnPesquisar').click(function () {
        CarregarGridPeriodos(idMatriz);        
    });

    $('#btnLimparPequisa').click(function () {
        var selectMatriz = $("#selectMatriz").data("kendoDropDownList");
        selectMatriz.select(0);
        $('#tbRazaoSocial').val('');        
        idMatriz = 0;
        CarregarGridPeriodos(idMatriz);
    });

    var txtJustificativa = document.getElementById('txtJustificativa');
    var contador = document.getElementById('caracteresRestantes');
    txtJustificativa.onkeyup = function () {
        contador.innerHTML = 500 - txtJustificativa.value.length;
    }
}

function CarregarMatrizes() {
    $('#selectMatriz').kendoDropDownList({
        dataTextField: "CodigoMatriz",
        dataValueField: "Id",
        dataSource: LoadDsMatrizes(),
        optionLabel: "Escolha ...",
        select: function (e) {
            var dataItem = this.dataItem(e.item.index());
            $('#tbRazaoSocial').val(dataItem.RazaoSocial);
            idMatriz = dataItem.Id;
        }
    });
}

function CarregarGridPeriodos(idMatriz) {
    var dsGrid = [];

    if ($.isNumeric(idMatriz)) {
        $.ajax({
            url: "/Fechamento/Pesquisar?idMatriz=" + idMatriz,
            type: "GET",
            async: false,
            dataType: "json",
            cache: false,
            success: function (result) {
                dsGrid = result;
            }
        });
    }
    else {
        dsGrid = undefined;
    }

    $("#gridFechamento").html("");
    $("#gridFechamento").kendoGrid({
        dataSource: {
            data: dsGrid,
            pageSize: 10,
            sort: {
                field: "AnoMes",
                dir: "desc"
            }
        },
        scrollable: true,
        sortable: true,
        pageable: true,
        columns: [
            { field: "Id", hidden: true },
            { field: "AnoMes", title: "Período", template: "#:FormataPeriodo(AnoMes)#", width: "260px" },
            { field: "DataFechamento", title: "Data do Fechamento", width: "260px", template: "#= kendo.toString(kendo.parseDate(DataFechamento, 'yyyy-MM-dd HH:mm:ss'), 'dd/MM/yyyy HH:mm:ss') #" },
            { field: "Aberto", width: "260px", title: "Status", template: "#:DescricaoStatus(Aberto)#" },
            {
                title: "Histórico",
                headerAttributes: { style: "text-align:center;" },
                template: "<button <a onclick='javascript:{ExibeHistorico(this);}' class='k-button'>Ver Detalhes</button>"
                    + "<span title='Histórico' class=''></span></a>",
                width: "140px",
                attributes: { style: "text-align:center;" },
                filterable: false
            },
            {
                title: "Ação",
                headerAttributes: { style: "text-align:center;" },
                template: "<button <a onclick=ConfirmarAberturaFechamento(this) class='k-button'>#:LabelBotaoStatus(Aberto)#</button>"
                    + "<span title='Ação' ></span></a>",
                width: "140px",
                attributes: { style: "text-align:center;" },
                filterable: false
            }
        ]
    });
}

function LabelBotaoStatus(varStatus) {
    if (varStatus == 1)
        return "Fechar";
    else
        return "Reabrir";                         
}

function FormataPeriodo(varAnoMes) {
    return varAnoMes.substr(4,2) + "/"  + varAnoMes.substr(0,4);
}

function DescricaoStatus(varStatus) {
    if (varStatus == 1)
        return "Aberto";
    else
        return "Fechado";
}

function ExibeHistorico(e) {
    var dataHtml = '';
    var dataItem = $("#gridFechamento").data("kendoGrid").dataItem(e.parentElement.parentElement);
    
    CarregarGridHistorico(dataItem.Id);

    // Dados do cabeçalho
    $("#tbMatriz").val($("#selectMatriz").val());
    $("#tbRazaoSocial2").val($("#tbRazaoSocial").val());
    $("#tbPeriodo").val(FormataPeriodo(dataItem.AnoMes));    

    CarregarPopUpFechamentoLog(dataItem.AnoMes);
}

function CarregarPopUpFechamentoLog(AnoMes) {
    $('#modalFechamentoLog').modal({ backdrop: 'static', keyboard: false });
    $('#modalFechamentoLog .modal-dialog .modal-header center .modal-title strong').html("");
    $('#modalFechamentoLog .modal-dialog .modal-header center .modal-title strong').html('Histórico do período ' + FormataPeriodo(AnoMes));
}

function CarregarGridHistorico(idFechamento) {
    var dsGrid = undefined;

    $("#labelHistoricoFechamento").show();

    $.ajax({
        url: "/Fechamento/BuscaHistorico?idFechamento=" + idFechamento,
        type: "GET",
        async: false,
        dataType: "json",
        cache: false,
        success: function (result) {
            if (result.Sucesso)
                dsGrid = result.Data;
            else
                ShowModalAlerta(result.Msg);
        }
    });

    $("#gridFechamentoLog").html("");
    $("#gridFechamentoLog").kendoGrid({
        dataSource: {
            data: dsGrid,
            pageSize: 7,
            sort: {
                field: "DataOcorrencia",
                dir: "desc"
            }
        },
        scrollable: true,
        resizable: true,
        sortable: true,
        pageable: true,
        columns: [
            { field: "DataOcorrencia", title: "Data", template: "#= kendo.toString(kendo.parseDate(DataOcorrencia, 'yyyy-MM-dd HH:mm:ss'), 'dd/MM/yyyy HH:mm:ss') #" },
            { field: "Responsavel", title: "Responsável" },
            { field: "Aberto", title: "Ação", template: "#:DescricaoAcao(Aberto)#" },
            {
                field: "Justificativa",                
                template: "<a onclick='javascript:{ExibirJustificativa(this);}' style='cursor: pointer;'>#=TextoJustificativa(Justificativa)#</a>",
                attributes: { style: "text-align:left;" }
            }
        ]
    });
}

function TextoJustificativa(e) {    
    if (e.length > 40)
        return e.substr(0, 40) + '...';
    else
        return e;
}

function ExibirJustificativa(e) {
    var dataHtml = '';
    var dataItem = $("#gridFechamentoLog").data("kendoGrid").dataItem(e.parentElement.parentElement);

    dataHtml = '<strong>Justificativa:</strong><br>' + dataItem.Justificativa;

    $('#modalDescricaoJustificativa').modal({ backdrop: 'static', keyboard: false });
    $('#modalDescricaoJustificativa .modal-dialog .modal-body').html(dataHtml);
}

function DescricaoAcao(varAcao) {
    if (varAcao == 0)
        return "Fechamento";
    else
        return "Reabertura";
}

function ConfirmarAberturaFechamento(e) {
     var dataHtml = '';
     var dataItem = $("#gridFechamento").data("kendoGrid").dataItem(e.parentElement.parentElement);

     objFechamento = dataItem;

     $('#modalAberturaFechamentoPeriodo').modal({ backdrop: 'static', keyboard: false });
     if (dataItem.Aberto == 1) { 
         $('#modalAberturaFechamentoPeriodo .modal-dialog .modal-header center .modal-title strong').html("Fechamento do período");
         $('#modalAberturaFechamentoPeriodo .modal-dialog .modal-body ').html("O período " +  FormataPeriodo(objFechamento.AnoMes) + " será fechado. Caso seja necessária alguma correção, o período deverá ser reaberto. Deseja continuar?");
     }
     else {
         $('#modalAberturaFechamentoPeriodo .modal-dialog .modal-header center .modal-title strong').html("Reabertura do período");
         $('#modalAberturaFechamentoPeriodo .modal-dialog .modal-body ').html("Deseja fazer a reabertura do período " + FormataPeriodo(objFechamento.AnoMes) + "?");
      }
 }

function Acao(form) {
     var ObjAtualizar = objFechamento;
     var ObjLog;
     if (objFechamento.Aberto == 1) {
         ObjAtualizar.Aberto = 0
         ObjAtualizar.DataFechamento = Date.now();
         ObjLog = {
             Id: null,
             IdFechamento: ObjAtualizar.Id,
             Aberto: 0,
             Responsavel: '    ',
             DataOcorrencia: Date.now(),
             Justificativa: '   '
         };
         GravarAcao(ObjAtualizar, ObjLog);
     }
     else {
         JustificaReabertura();
     }

     FecharModal(form);
 }

 function JustificaReabertura()
 {
     var usuarioReabertura;

     $.ajax({
         url: '/Fechamento/ObterUsuarioLogado',
         type: 'POST',
         async: false,
         contentType: 'application/json; charset=utf-8',
         success: function (result) {
             usuarioReabertura = result.UsuarioLogado;
         }
     });

     $('#modalJustificativa').modal({ backdrop: 'static', keyboard: false });
     $('#modalJustificativa .modal-dialog .modal-header center .modal-title strong').html("Processo de reabertura do período " + FormataPeriodo(objFechamento.AnoMes));

     $('#txtUsuario').val(usuarioReabertura);
     $('#txtData').val(kendo.toString(kendo.parseDate(new Date().toJSON().slice(0, 10), 'yyyy-MM-dd'), 'dd/MM/yyyy'));
   
     $('#txtJustificativa').val('');
 }

 function GravaJustificativa(form) {
     var ObjAtualizar = objFechamento;
     var ObjLog;
     var strJustificativa = $('#txtJustificativa').val();
     if  (strJustificativa == '' || strJustificativa == null) {
         ShowModalAlerta('Favor informar a Justificativa.');
     }
     else {
         ObjAtualizar.Aberto = 1
         ObjLog = {
             Id: null,
             IdFechamento: ObjAtualizar.Id,
             Aberto: 1,
             Responsavel: '',
             DataOcorrencia: Date.now(),
             Justificativa: $('#txtJustificativa').val()
         };
         GravarAcao(ObjAtualizar, ObjLog);
         FecharModal(form);
     }
 }

 function GravarAcao(ObjFecha,ObjFechaLog) {
     $.ajax({
         url: '/Fechamento/AlterarStatusPeriodo',
         data: JSON.stringify({ fechamento: ObjFecha, fechamentoLog: ObjFechaLog }),
         type: 'POST',
         async: false,
         contentType: 'application/json; charset=utf-8',
         success: function (result) {
             if (result.Sucesso) {                 
                 ShowModalSucesso(result.Msg);
             }
             else {                 
                 ShowModalAlerta(result.Msg);
             }
         }
     });

     CarregarGridPeriodos(idMatriz);
 }