/*FILTROS - RECUPERAR VALORES MATRIZ*/
var idEmpresa = 0;

function GetObj() {
    var idMatriz = 0;

    var matrizList = $('#txtCodMatriz').data("kendoDropDownList");
    idMatriz = matrizList.dataItem().Id;

    return idMatriz;
}

/*DATABOUND - PREENCHER VALORES DA EMPRESA NA TELA*/
function PreencherValoresCampos(saldo) {
    var ano = (saldo.Periodo).substring(0, 4);
    var mes = (saldo.Periodo).substring(4, 6);
    $("#txtPeriodo").data("kendoDatePicker").value(mes+'/'+ano);

    $("#txtCredMIPIS").data("kendoNumericTextBox").value(saldo.CredMIPIS);
    $("#txtCredMICOFINS").data("kendoNumericTextBox").value(saldo.CredMICOFINS);

    $("#txtCredNMIPIS").data("kendoNumericTextBox").value(saldo.CredNMIPIS);
    $("#txtCredNMICOFINS").data("kendoNumericTextBox").value(saldo.CredNMICOFINS);

    $("#txtCredMIEPIS").data("kendoNumericTextBox").value(saldo.CredMIEPIS);
    $("#txtCredMIECOFINS").data("kendoNumericTextBox").value(saldo.CredMIECOFINS);

    $("#txtCredImpMIPIS").data("kendoNumericTextBox").value(saldo.CredImpMIPIS);
    $("#txtCredImpMICOFINS").data("kendoNumericTextBox").value(saldo.CredImpMICOFINS);

    $("#txtCredImpNMIPIS").data("kendoNumericTextBox").value(saldo.CredImpNMIPIS);
    $("#txtCredImpNMICOFINS").data("kendoNumericTextBox").value(saldo.CredImpNMICOFINS);

    $("#txtCredImpMIEPIS").data("kendoNumericTextBox").value(saldo.CredImpMIEPIS);
    $("#txtCredImpMIECOFINS").data("kendoNumericTextBox").value(saldo.CredImpMIECOFINS);
}

/*GRID - HISTÓRICO DE ALTERAÇÕES*/
function MontarHistoricoAlteracoes(logs) {
    $("#gridHistorico").html("");
    $("#gridHistorico").removeAttr("class");
    $("#gridHistorico").removeAttr("data-role");
    $("#gridHistorico").kendoGrid({
        dataSource: {
            data: logs,
            total: logs.length,
            pageSize: 5
        },
        scrollable: true,
        sortable: true,
        resizable: true,
        pageable: {
            refresh: true,
            pageSizes: true,
            buttonCount: 10
        },
        columns: [{
            title: "Usuário",
            field: "Nome",
            width: "20%"
        }, {
            title: "Modificação/Ocorrência",
            field: "Modificacao",
            width: "50%px"
        },
        {
            title: "Data da Ocorrência",
            field: "DataOcorrencia",
            template: "#= kendo.toString(kendo.parseDate(DataOcorrencia, 'yyyy-MM-dd HH:mm:ss'), 'dd/MM/yyyy  HH:mm:ss') #",
            width: "30%"
        }]
    });
}

/*CONSTRUTOR - CARREGAR CONFIGURAÇÕES INICIAIS DE PÁGINA*/
function CarregarComponentes() {

    $("#txtCredMIPIS").kendoNumericTextBox({
        format: 'c',
        decimal: 2
    });
    $("#txtCredMICOFINS").kendoNumericTextBox({
        format: 'c',
        decimal: 2
    });
    $("#txtCredNMIPIS").kendoNumericTextBox({
        format: 'c',
        decimal: 2
    });
    $("#txtCredNMICOFINS").kendoNumericTextBox({
        format: 'c',
        decimal: 2
    });
    $("#txtCredMIEPIS").kendoNumericTextBox({
        format: 'c',
        decimal: 2
    });
    $("#txtCredMIECOFINS").kendoNumericTextBox({
        format: 'c',
        decimal: 2
    });
    $("#txtCredImpMIPIS").kendoNumericTextBox({
        format: 'c',
        decimal: 2
    });
    $("#txtCredImpMICOFINS").kendoNumericTextBox({
        format: 'c',
        decimal: 2
    });
    $("#txtCredImpNMIPIS").kendoNumericTextBox({
        format: 'c',
        decimal: 2
    });
    $("#txtCredImpNMICOFINS").kendoNumericTextBox({
        format: 'c',
        decimal: 2
    });
    $("#txtCredImpMIEPIS").kendoNumericTextBox({
        format: 'c',
        decimal: 2
    });
    $("#txtCredImpMIECOFINS").kendoNumericTextBox({
        format: 'c',
        decimal: 2
    });

    $("#txtPeriodo").kendoDatePicker({
        start: "year",
        depth: "year",
        format: "MM/yyyy"
    });

    $("#btnSalvarSaldos").kendoButton({
        enable: false
    });

    $("#btnLimparSaldos").kendoButton({
        enable: false
    });

    $("#btnHabilitarEdicao").kendoButton({
        enable: false
    });

    $('#btnLimparSaldos').click(function () {
        LimparCampos();
    });

    $('#btnSalvarSaldos').click(function () {
        SalvarSaldo();
    });

    $('#btnHabilitarEdicao').click(function () {
        var textoBotao = $('#btnHabilitarEdicao').val();
        if (textoBotao == "0")
        {
            HabilitarCampos();
            $('#btnHabilitarEdicao').html('<span class="glyphicon glyphicon-pencil"></span>&nbsp;Desabilitar Edição');
            $('#btnHabilitarEdicao').val("1");
        }
        else {
            $('#btnHabilitarEdicao').html('<span class="glyphicon glyphicon-pencil"></span>&nbsp;Habilitar Edição');
            $('#btnHabilitarEdicao').val("0");
            BloquearCampos();
        }
    });
}

/*AÇÕES - BLOQUEIO DE CAMPOS*/
function BloquearCampos() {
    $("#txtCredMIPIS").data("kendoNumericTextBox").enable(false);
    $("#txtCredMICOFINS").data("kendoNumericTextBox").enable(false);

    $("#txtCredNMIPIS").data("kendoNumericTextBox").enable(false);
    $("#txtCredNMICOFINS").data("kendoNumericTextBox").enable(false);

    $("#txtCredMIEPIS").data("kendoNumericTextBox").enable(false);
    $("#txtCredMIECOFINS").data("kendoNumericTextBox").enable(false);

    $("#txtCredMIPIS").data("kendoNumericTextBox").enable(false);
    $("#txtCredMIPIS").data("kendoNumericTextBox").enable(false);

    $("#txtCredImpMIPIS").data("kendoNumericTextBox").enable(false);
    $("#txtCredImpMICOFINS").data("kendoNumericTextBox").enable(false);

    $("#txtCredImpNMIPIS").data("kendoNumericTextBox").enable(false);
    $("#txtCredImpNMICOFINS").data("kendoNumericTextBox").enable(false);

    $("#txtCredImpMIEPIS").data("kendoNumericTextBox").enable(false);
    $("#txtCredImpMIECOFINS").data("kendoNumericTextBox").enable(false);

    $("#txtPeriodo").data("kendoDatePicker").enable(false);

    $('#btnSalvarSaldos').data('kendoButton').enable(false);
    $('#btnLimparSaldos').data('kendoButton').enable(false);
}

/*AÇÕES - HABILITAR CAMPOS PARA EDIÇÃO*/
function HabilitarCampos() {
    $("#txtCredMIPIS").data("kendoNumericTextBox").enable();
    $("#txtCredMICOFINS").data("kendoNumericTextBox").enable();

    $("#txtCredNMIPIS").data("kendoNumericTextBox").enable();
    $("#txtCredNMICOFINS").data("kendoNumericTextBox").enable();

    $("#txtCredMIEPIS").data("kendoNumericTextBox").enable();
    $("#txtCredMIECOFINS").data("kendoNumericTextBox").enable();

    $("#txtCredMIPIS").data("kendoNumericTextBox").enable();
    $("#txtCredMIPIS").data("kendoNumericTextBox").enable();

    $("#txtCredImpMIPIS").data("kendoNumericTextBox").enable();
    $("#txtCredImpMICOFINS").data("kendoNumericTextBox").enable();

    $("#txtCredImpNMIPIS").data("kendoNumericTextBox").enable();
    $("#txtCredImpNMICOFINS").data("kendoNumericTextBox").enable();

    $("#txtCredImpMIEPIS").data("kendoNumericTextBox").enable();
    $("#txtCredImpMIECOFINS").data("kendoNumericTextBox").enable();

    $("#txtPeriodo").data("kendoDatePicker").enable();

    $('#btnSalvarSaldos').data('kendoButton').enable(true);
    $('#btnLimparSaldos').data('kendoButton').enable(true);
}

/*AÇÕES - LIMPAR CAMPOS*/
function LimparCampos() {
    $("#txtCredMIPIS").data("kendoNumericTextBox").value(0);
    $("#txtCredMICOFINS").data("kendoNumericTextBox").value(0);

    $("#txtCredNMIPIS").data("kendoNumericTextBox").value(0);
    $("#txtCredNMICOFINS").data("kendoNumericTextBox").value(0);

    $("#txtCredMIEPIS").data("kendoNumericTextBox").value(0);
    $("#txtCredMIECOFINS").data("kendoNumericTextBox").value(0);

    $("#txtCredMIPIS").data("kendoNumericTextBox").value(0);
    $("#txtCredMIPIS").data("kendoNumericTextBox").value(0);

    $("#txtCredImpMIPIS").data("kendoNumericTextBox").value(0);
    $("#txtCredImpMICOFINS").data("kendoNumericTextBox").value(0);

    $("#txtCredImpNMIPIS").data("kendoNumericTextBox").value(0);
    $("#txtCredImpNMICOFINS").data("kendoNumericTextBox").value(0);

    $("#txtCredImpMIEPIS").data("kendoNumericTextBox").value(0);
    $("#txtCredImpMIECOFINS").data("kendoNumericTextBox").value(0);

    $("#txtPeriodo").data("kendoDatePicker").value('07/2015');

    $("#gridHistorico").html("");
    $("#gridHistorico").removeAttr("class");
    $("#gridHistorico").removeAttr("data-role");
}

/*AÇÕES - SALVAR DADOS*/
function SalvarSaldo() {
    $("#loading-page").show();
    var obj = [];
    var periodo = kendo.toString(kendo.parseDate($("#txtPeriodo").data("kendoDatePicker").value(), 'yyyy-MM-dd'), 'yyyyMM');
    var idEmpresa = $('#txtCodMatriz').data('kendoDropDownList').value();
    obj.push({
        IdEmpresa: idEmpresa,
        Periodo: periodo,
        CredMIPIS: $("#txtCredMIPIS").data("kendoNumericTextBox").value(),
        CredMICOFINS: $("#txtCredMICOFINS").data("kendoNumericTextBox").value(),
        CredNMIPIS: $("#txtCredNMIPIS").data("kendoNumericTextBox").value(),
        CredNMICOFINS: $("#txtCredNMICOFINS").data("kendoNumericTextBox").value(),
        CredMIEPIS: $("#txtCredMIEPIS").data("kendoNumericTextBox").value(),
        CredMIECOFINS: $("#txtCredMIECOFINS").data("kendoNumericTextBox").value(),
        CredImpMIPIS: $("#txtCredImpMIPIS").data("kendoNumericTextBox").value(),
        CredImpMICOFINS: $("#txtCredImpMICOFINS").data("kendoNumericTextBox").value(),
        CredImpNMIPIS: $("#txtCredImpNMIPIS").data("kendoNumericTextBox").value(),
        CredImpNMICOFINS: $("#txtCredImpNMICOFINS").data("kendoNumericTextBox").value(),
        CredImpMIEPIS: $("#txtCredImpMIEPIS").data("kendoNumericTextBox").value(),
        CredImpMIECOFINS: $("#txtCredImpMIECOFINS").data("kendoNumericTextBox").value()
    });

    $.ajax({
        url: "/SaldosIniciais/AtualizarSaldo",
        type: "POST",
        data: JSON.stringify(obj[0]),
        async: false,
        dataType: "json",
        contentType: "application/json",//necessário para stringfy
        cache: false,
        success: function (result) {
            if (result.Sucesso) {
                ShowModalSucesso(result.Msg);
                BuscarDadosSaldos(idEmpresa);
            }
            else
                ShowModalAlerta(result.Msg);
        }
    });

    $("#loading-page").hide();
}

/*DATASOURCE - BUSCAR VALORES ARMAZENADOS*/
function BuscarDadosSaldos(obj) {
    idEmpresa = obj;
    $("#loading-page").show();
    $.ajax({
        url: "/SaldosIniciais/BuscarSaldo",
        type: "GET",
        data: { idEmpresa: obj },
        async: false,
        dataType: "json",
        cache: false,
        success: function (result) {
            if (result.Sucesso) {
                PreencherValoresCampos(result.Data);
                MontarHistoricoAlteracoes(result.Logs);
            }
            else
                ShowModalAlerta(result.Msg);
        }
    });
    $('#btnHabilitarEdicao').data('kendoButton').enable(true);
    $("#loading-page").hide();
}