var idProt = "0";

function CarregaComponentes() {
    $('#labelCNPJ').show();
    $('#selectCNPJ').show();

    LoadDsGrid();
    AutoComplete();

    $('#btnPesquisarDevolucoes').click(function () {
        BuscarDadosGrid();
    });

    $('#btnLimparPequisa').click(function () {
        document.getElementById("txtCodDevolucao").value = "";
        document.getElementById("txtDataInicio").value = "";
        document.getElementById("txtDataFim").value = "";
        document.getElementById("txtNFVenda").value = "";
        document.getElementById("txtDataInicioNFVenda").value = "";
        document.getElementById("txtDataFimNFVenda").value = "";
        document.getElementById("txtNFDevolucao").value = "";
        document.getElementById("txtDataInicioNFDevolucao").value = "";
        document.getElementById("txtDataFimNFDevolucao").value = "";
        document.getElementById("txtDataInicioStatus").value = "";
        document.getElementById("txtDataFimStatus").value = "";

        var dropdownlist = $("#selectStatus").data("kendoDropDownList");
        dropdownlist.select(0);

        BuscarDadosGrid();
    });

    StatusDropDown();

    $('#txtCodDevolucao').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            BuscarDadosGrid();
        }
    });

    $('#txtNFVenda').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            BuscarDadosGrid();
        }
    });

    $('#txtNFDevolucao').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            BuscarDadosGrid();
        }
    });
}

function AutoComplete() {
    var kgrid = $("#grid").data("kendoGrid");

    if (kgrid == undefined) {
        return;
    }

    var dsOld = kgrid.dataSource.data();
    var dsNFVenda = [];
    var dsNFDevolucao = [];

    // Notas
    for (var i in dsOld) {
        if (dsNFVenda.indexOf(dsOld[i].numeroNotaFiscal) == -1 && dsOld[i].numeroNotaFiscal != undefined) {
            dsNFVenda.push("" + dsOld[i].numeroNotaFiscal + "");
        }

        if (dsNFDevolucao.indexOf(dsOld[i].numeroNotaFiscalDevolucao) == -1 && dsOld[i].numeroNotaFiscalDevolucao != undefined && dsOld[i].numeroNotaFiscalDevolucao != 0) {
            dsNFDevolucao.push("" + dsOld[i].numeroNotaFiscalDevolucao + "");
        }        
    }

    $("#txtNFVenda").kendoAutoComplete({
        dataSource: dsNFVenda,
        filter: "startswith",
        placeholder: "Nº da nota fiscal"
    });

    $("#txtNFDevolucao").kendoAutoComplete({
        dataSource: dsNFDevolucao,
        filter: "startswith",
        placeholder: "Nº da nota fiscal"
    });

    var dadosGrid = new kendo.data.DataSource({
        data: kgrid.dataSource.data()
    });

    $("#txtCodDevolucao").kendoAutoComplete({
        dataSource: dadosGrid,
        dataTextField: "numeroProtocolo",
        dataValueField: "numeroProtocolo",
        filter: "contains",
        placeholder: "Número do Protocolo"
    });
}

function LoadDsGrid(cnpj) {
    var datasource = undefined;
    cnpj = LerCookie("SelectCNPJ");
    if (cnpj == undefined) {
        CarregarCombo();
    }

    $.ajax({
        url: "/Historico/Pesquisar?cnpj=" + cnpj,
        type: "GET",
        dataType: "json",
        cache: false,
        async: false,
        success: function (result) {
            if (result.length > 0) {
                $("#chkSelectAll").show();
                $("#verItens").show();
                datasource = result;
                $("#grid").html("");
                GridHistorico(datasource);
                HabilitarBotaoGridHistorico();                       
            }
            else {
                $("#chkSelectAll").hide();
                $("#verItens").hide();
                $("#grid").removeAttr("class");
                $("#grid").html("<p>Nenhum Protocolo encontrado!</p>");                
            }
        }
    });
}

function GridHistorico(ds) {
    $("#grid").html("");
    $("#grid").kendoGrid({
        dataSource: {
            data: ds,
            schema: {
                model: {
                    fields: {
                        numeroNotaFiscal: { type: "string" },
                        NFDevolucao: { type: "string" },
                        SelectItem: { editable: true, type: "boolean" },
                        dataSolicitacaoProtocolo: { type: "date" },
                        dataEmissaoNotaFiscalVenda: { type: "date" },
                        dataEmissaoNotaFiscalDevolucao: { type: "date" },
                        dataUltimaAtualizacaoStatus: { type: "date" },
                        idOrigemUsuario: { type: "string" }
                    }
                }
            },
            pageSize: 10
        },
        scrollable: true,
        groupable: true,
        resizable: true,
        sortable: true,
        pageable: {
            pageSizes: [10, 25, 50]
        },
        // detailInit: detailInit,
        columns: [
            { field: "SelectItem", title: "&nbsp;", width: "30px", template: "#=GetSelectionStatus(data.SelectItem)#", sortable: false },
            { field: "cancelamentoExclusao", hidden: true },
            { field: "numeroProtocolo", title: "Protocolo" },
            {
                field: "dataSolicitacaoProtocolo",
                title: "Data da Solicitação",
                template: "#= kendo.toString(kendo.parseDate(dataSolicitacaoProtocolo, 'yyyy-MM-dd'), 'dd/MM/yyyy') #",
                width: "120px"
            },
            {
                field: "descricaoStatus",
                title: "Status",
                width: "150px",
                template: "<a onclick='javascript:{ExibirHistoricoProtocolo(this);}' style='cursor: pointer;'>#=descricaoStatus#</a>"
            },
            {
                field: "numeroNotaFiscal",
                title: "NF-e Devolução",
                width: "120px",
                template: kendo.template($("#colunaNFeDevolucao").html())
            },
            {
                title: " ",
                template: "<a onclick='javascript:{ShowDetails(this);}' class='k-button'>"
                    + "<span title='Visualizar Resumo' class='glyphicon glyphicon-search'></span></a>",
                width: "48px",
                filterable: false
            },
            {
                title: " ",
                template: "<a onclick='javascript:{SendEmail(this);}' class='k-button'>"
                    + "<span title='Enviar Resumo por e-mail' class='glyphicon glyphicon-envelope'></span></a>",
                width: "48px",
                filterable: false
            },           
            {
                title: " ",
                template: kendo.template($("#botaoCancelarTemplate").html()),
                width: "48px",
                filterable: false
            },
            {
                title: " ",
                template: kendo.template($("#botaoExcluirTemplate").html()),
                width: "48px",
                filterable: false
            }
        ]
    });
}

function detailInit(e) {
    $("<div/>").appendTo(e.detailCell).kendoGrid({
        dataSource: {
            data: e.data.lstItens,
            serverPaging: true,
            serverSorting: true,
            serverFiltering: true,
            pageSize: 5
        },
        scrollable: false,
        sortable: true,
        pageable: true,
        columns: [
            { field: "descricaoProduto", title: "Produto" },
            { field: "cEAN", title: "Código de Barras" },
            { field: "qtdDevolvida", title: "Quantidade Devolvida", width: "150px" }
        ]
    });
}

function StatusDropDown() {   
    var dsStatus = undefined;
    $.ajax({
        url: "/Historico/GetStatusProtocoloCombo",
        type: "GET",        
        dataType: "json",
        async: false,
        success: function (result) {
            if (result.length > 0) {
                dsStatus = result;
            }
            else {
                ShowModalAlerta("Erro ao obter os Status dos Protocolos de Devolução");
                return;
            }          
        }
    });

    $('#selectStatus').kendoDropDownList({     
        dataSource: dsStatus,
        optionLabel: "Escolha ...",
        index: 0,
        select: function (e) {
            var item = e.item;
            var text = item.text();
            if (text == "Escolha ...") {
                $('#txtDataInicioStatus').data('kendoDatePicker').enable(false);
                $('#txtDataFimStatus').data('kendoDatePicker').enable(false);
            }
            else {
                $('#txtDataInicioStatus').data('kendoDatePicker').enable(true);
                $('#txtDataFimStatus').data('kendoDatePicker').enable(true);
            }
        }
    });
}

function GetSelectionStatus(isSelected) {
    if (isSelected) {
        return "<input class='checkedRow' name='checkedRow' onclick='javascript:{SelecionarItem(this);}' type='checkbox' value='true' checked='checked' />";
    }
    else {
        return "<input class='checkedRow' name='checkedRow' onclick='javascript:{SelecionarItem(this);}' type='checkbox' value='false' />";
    }
}

function SelecionarItem(e) {
    var dataItem = $("#grid").data("kendoGrid").dataItem(e.parentElement.parentElement);
    if (e.checked) {
        dataItem.SelectItem = true;
    }
    else {
        dataItem.SelectItem = false;
    }
}

function SelecionarTodos() {
    var checked = $("#SelectAll")[0].checked;
    var dataSource = $("#grid").data("kendoGrid").dataSource.data();
    for (var i in dataSource) {
        dataSource[i].SelectItem = checked;
    }

    $("#grid").data("kendoGrid").refresh();
}

function ShowDetails(e) {
    $("#loading-page").show();
    var dataItem = $("#grid").data("kendoGrid").dataItem(e.parentElement.parentElement);
    var title = "RESUMO DO PEDIDO DE DEVOLUÇÃO";

    var itensCollection = new Array();
    itensCollection.push(dataItem.idProtocolo);
    ResumoDevolucoes("/Historico/ResumoProtocolos", itensCollection, title);
}

function ShowAllDetails() {
    $("#loading-page").show();
    var dataItens = $("#grid").data("kendoGrid").dataSource.data();
    var itensCollection = new Array();

    for (var i = 0; i < dataItens.length; i++) {
        if (dataItens[i].SelectItem)
            itensCollection.push(dataItens[i].idProtocolo);
    }

    if (itensCollection.length > 0) {
        var title = "RESUMO DO PEDIDO DE DEVOLUÇÃO";
        ResumoDevolucoes("/Historico/ResumoProtocolos", itensCollection, title);
    }
    else {
        var msg = "É necessário selecionar pelo menos um item!";
        ShowModalAlerta(msg);
        $("#loading-page").hide();
    }
}

function SendEmail(e) {
    var dataItem = $("#grid").data("kendoGrid").dataItem(e.parentElement.parentElement);
    var emailUsuarioLogado = '';

    idProt = dataItem.idProtocolo;

    $.ajax({
        url: "/Historico/GetEmailUsuarioLogado",
        type: "GET",
        dataType: "json",
        async: false,
        success: function (result) {
            if (result.length > 0) {
                emailUsuarioLogado = result + ';';
            }
        }
    });   

    $('#modalEnviarEmail').modal({ backdrop: 'static', keyboard: false });
    $("#txtEmail").val(emailUsuarioLogado);
}

function EnviarProtocolo() {
    var emails = $('#txtEmail').val();

    $.ajax({
        url: "/Historico/EnviarEmailProtocolo",
        type: 'POST',
        async: true,
        data: {
            idProtocolo: idProt, destinatarios: emails
        },
        success: function (envio) {
            if (envio == "") {
                $('#modalEnviarEmail').modal('hide');
                ShowModalSucesso("E-Mail enviado com Sucesso!");
            }
            else {
                ShowModalAlerta(envio + "!");
            }
        }
    });
}

function CancelarProtocolo(e) {
    var dataItem = $("#grid").data("kendoGrid").dataItem(e.parentElement.parentElement);
    var dataHtml = '';

    idProt = dataItem.idProtocolo;

    dataHtml = '<div class="row">'
                + '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">'
                    + 'Confirma cancelamento do Protocolo nº <strong>' + dataItem.numeroProtocolo + '</strong> ?'
                + '</div>'
              + '</div>';

    $('#modalCancelamentoProtocolo').modal({ backdrop: 'static', keyboard: false });
    $('#modalCancelamentoProtocolo .modal-dialog .modal-header center .modal-title strong').html("");
    $('#modalCancelamentoProtocolo .modal-dialog .modal-header center .modal-title strong').html('Cancelamento de Protocolo');
    $('#modalCancelamentoProtocolo .modal-dialog .modal-body').html("");
    $('#modalCancelamentoProtocolo .modal-dialog .modal-body').html(dataHtml);
}

function Cancelar() {
    $('#modalCancelamentoProtocolo').modal('hide');

    $.ajax({
        url: '/Historico/CancelarProtocolo',
        type: 'POST',
        async: true,
        data: {
            idProtocolo: idProt
        },
        success: function (result) {
            if (result == "") {
                ShowModalSucesso("Protocolo cancelado com Sucesso!");
                LoadDsGrid(null);
            }
            else {
                ShowModalAlerta(result + "!");
            }
        }
    });
}

function ExcluirProtocolo(e) {
    var dataItem = $("#grid").data("kendoGrid").dataItem(e.parentElement.parentElement);
    var dataHtml = '';

    idProt = dataItem.idProtocolo;

    dataHtml = '<div class="row">'
                + '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">'
                    + 'Deseja realmente cancelar o Protocolo nº <strong>' + dataItem.numeroProtocolo + '</strong> por falta de conclusão?'
                + '</div>'
              + '</div>';

    $('#modalExclusaoProtocolo').modal({ backdrop: 'static', keyboard: false });
    $('#modalExclusaoProtocolo .modal-dialog .modal-header center .modal-title strong').html("");
    $('#modalExclusaoProtocolo .modal-dialog .modal-header center .modal-title strong').html('Exclusão de Protocolo');
    $('#modalExclusaoProtocolo .modal-dialog .modal-body').html("");
    $('#modalExclusaoProtocolo .modal-dialog .modal-body').html(dataHtml);
}

function Excluir() {
    $('#modalExclusaoProtocolo').modal('hide');

    $.ajax({
        url: '/Historico/ExcluirProtocolo',
        type: 'POST',
        async: true,
        data: {
            idProtocolo: idProt
        },
        success: function (result) {
            if (result == "") {
                ShowModalSucesso("Cancelamento por Prazo realizado com sucesso!");
                LoadDsGrid(null);
            }
            else {
                ShowModalAlerta(result + "!");
            }
        }
    });
}

function ExibirHistoricoProtocolo(e) {  
    var dataHtml = '';
    var dataItem = $("#grid").data("kendoGrid").dataItem(e.parentElement.parentElement);

    cnpj = LerCookie("SelectCNPJ");
    if (cnpj == undefined) {
        cnpj = $("#selectCNPJ").data("kendoDropDownList")._selectedValue;
    }

    idProt = dataItem.idProtocolo;

    $('#modalHistoricoProtocolo').modal({ backdrop: 'static', keyboard: false });
    $('#modalHistoricoProtocolo .modal-dialog .modal-body').html(CarregarGridHistoricoProtocolo(idProt, cnpj));   
}

function ExibirDetalhesNFe(e)
{
    var dataHtml = '';
    var dataEmissao = '';
    var dataItem = $("#grid").data("kendoGrid").dataItem(e.parentElement.parentElement);    
    
    if (new Date(dataItem.dataEmissaoNotaFiscalDevolucao) > 1) {
        dataEmissao = kendo.toString(kendo.parseDate(dataItem.dataEmissaoNotaFiscalDevolucao, 'yyyy-MM-dd'), 'dd/MM/yyyy')
    }
    
    dataHtml = 'Número Nota Fiscal: <strong>' + dataItem.numeroNotaFiscalDevolucao + '</strong><br>'
             + 'Data de Emissão: <strong>' + dataEmissao + '</strong>';

    $('#modalDetalhesNotaFiscal').modal({ backdrop: 'static', keyboard: false });
    $('#modalDetalhesNotaFiscal .modal-dialog .modal-body').html("");
    $('#modalDetalhesNotaFiscal .modal-dialog .modal-body').html(dataHtml);
}

function CarregarGridHistoricoProtocolo(idProt, cnpj)
{
    $.ajax({
        url: "/Historico/Pesquisar",
        type: "GET",
        async: false,
        cache: false,
        dataType: "json",
        data: {
            cnpj: cnpj,
            idProtocolo: idProt
        },
        success: function (result) {
            if (result.length > 0) {                
                NumeroProtocoloHistorico(result);               
                GridHistoricoProtocolo(result[0].lstHistorico);
            }
            else {
                $("#gridHistorico").removeAttr("class");
                $("#gridHistorico").html("<p>Nenhum histórico encontrado!</p>");
            }
        }
    });
}

function NumeroProtocoloHistorico(ds)
{
    var dataHtml = '<div class="row">'
                + '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">'
                    + '<h3>Protocolo nº: ' + ds[0].numeroProtocolo + '</h3>'
                + '</div>'
               + '</div>';

    $("#numeroProtocolo").html(dataHtml);
}

function GridHistoricoProtocolo(ds)
{
    $("#gridHistorico").kendoGrid({
        dataSource: {
            data: ds,
            pageSize: 5            
        },
        scrollable: true,
        sortable: true,
        selectable: true,       
        groupable: true,
        resizable: true,
        cache: false,
        columns: [
            {
                field: "dataAlteracao",
                title: "Data Alteração",
                type: "date",
                template: "#= kendo.toString(kendo.parseDate(dataAlteracao, 'yyyy-MM-dd'), 'dd/MM/yyyy') #",
                width: "15%"
            },
            { field: "descricaoStatus", title: "Status", width: "20%" },
            { field: "Motivo", title: "Motivo", width: "50%" },
            { field: "nomeUsuario", title: "Usuário", width: "15%" }          
        ]
    });
}