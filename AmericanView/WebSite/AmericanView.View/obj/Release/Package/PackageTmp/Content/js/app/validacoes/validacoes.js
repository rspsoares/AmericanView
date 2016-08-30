var idMatriz;
var idValidacao;
var idResultado;
var notaFiscal;
var itemNotaFiscal;
var expandedRowUid;

// ******** VALIDAÇÕES **********
function CarregaComponentes() {
    CarregarMatrizes();     
    
    $('#btnPesquisar').click(function () {      
        CarregarGridValidacoes(idMatriz);
    });

    $('#btnLimparPequisa').click(function () {
        var selectMatriz = $("#selectMatriz").data("kendoDropDownList");
        selectMatriz.select(0);
        $('#tbRazaoSocial').val('');
        idMatriz = 0;
        CarregarGridValidacoes(idMatriz);
    });

    $('#btnFiltrarResultados').click(function () {
        var grid = $("#gridResultados").data("kendoGrid");
        BuscarDadosGrid(grid);
    });

    $("#tbItemBaseCalculoICMS, #tbItemTotalItem")
      .keypress(function (e) {
          if (e.which != 8 && e.which != 0 && e.which != 44 && (e.which < 48 || e.which > 57))
              return false;
      });

    jQuery("#tbItemBaseCalculoICMS").blur(function () {
        var regex = /^[0-9]+([\,\.][0-9]+)?$/g;
        if (regex.test($('#tbItemBaseCalculoICMS').val().replace(".", "")))
            $('#tbItemBaseCalculoICMS').val(parseFloat($('#tbItemBaseCalculoICMS').val().replace(".", "").replace(",", ".")).FormatarMoeda(2, '', '.', ','));
        else
            $('#tbItemBaseCalculoICMS').val("0,00");
    });

    jQuery("#tbItemTotalItem").blur(function () {
        var regex = /^[0-9]+([\,\.][0-9]+)?$/g;
        if (regex.test($('#tbItemTotalItem').val().replace(".", "")))
            $('#tbItemTotalItem').val(parseFloat($('#tbItemTotalItem').val().replace(".", "").replace(",", ".")).FormatarMoeda(2, '', '.', ','));
        else
            $('#tbItemTotalItem').val("0,00");
    });
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

/*GRID - Períodos Validados*/
function CarregarGridValidacoes(idMatriz) {
    var dsGrid = [];

    if ($.isNumeric(idMatriz)) {
        $("#gridValidacoes").html("");
        $("#gridValidacoes").kendoGrid({
            dataSource: {
                transport: {
                    read: {
                        url: "/Validacoes/PesquisarValidacoes",
                        dataType: "json",
                        type: "GET",
                        async: false,
                        cache: false
                    },
                    parameterMap: function (data, type) {
                        if (type == "read") {
                            return { idMatriz: idMatriz }
                        }
                    }
                },
                pageSize: 10,
                sort: {
                    field: "Periodo",
                    dir: "desc"
                },
                schema: {
                    data: function (result) {
                        return result.Data;
                    },
                    total: function (result) {
                        return result.Total;
                    },
                    model: {
                        id: "Id",
                        fields: {
                            IdEmpresa: { validation: { required: true } },
                            Editavel: { validation: { required: true } },
                            Periodo: { type: "text", validation: { required: false } },
                            InicioValidacao: { type: "date", validation: { required: false } },
                            FinalValidacao: { type: "date", validation: { required: false } },
                            StatusId: { validation: { required: false } },
                            Status: { validation: { required: false } }
                        }
                    }
                }
            },
            scrollable: true,
            sortable: true,
            pageable: true,
            columns: [
                { field: "Id", hidden: true },
                { field: "Editavel", hidden: true },
                {
                    field: "Status",
                    title: "Ações",
                    width: "35px",
                    filterable: false,
                    template: "<button class='k-button' onclick='javascript:{RevalidarPeriodo(this);}' #= (Status != 'Finalizado' || Editavel == 0) ? 'disabled' : '' #>Revalidar</button>",
                    attributes: { style: "text-align:center;" }
                },
                { field: "Periodo", title: "Período", width: "80px" },
                { field: "InicioValidacao", title: "Início Validação", template: "#= (InicioValidacao == null) ? '-' : kendo.toString(kendo.parseDate(InicioValidacao, 'yyyy-MM-dd HH:mm:ss'), 'dd/MM/yyyy HH:mm:ss') #", width: "80px" },
                { field: "FinalValidacao", title: "Final da Validação", template: "#= (FinalValidacao == null) ? '-' : kendo.toString(kendo.parseDate(FinalValidacao, 'yyyy-MM-dd HH:mm:ss'), 'dd/MM/yyyy HH:mm:ss') #", width: "80px" },
                { field: "Status", title: "Status", width: "40px" },
                {
                    field: "Status",
                    title: "Detalhes",
                    template: "<button class='k-button' onclick='javascript:{EditarValidacao(this);}' #= (Status != 'Finalizado' || Status == 'Falha') ? 'disabled' : '' #>Ver Sumário</button>",
                    attributes: { style: "text-align:center;" },
                    filterable: false,
                    width: "40px"
                }
            ]
        });
        setInterval(function () {
            $('#gridValidacoes').data('kendoGrid').dataSource.read();
        }, 15000);
    }
}

/*Ações de GRID - Direcionar Sumário*/
function EditarValidacao(e) {
    var dataItem = $("#gridValidacoes").data("kendoGrid").dataItem(e.parentElement.parentElement);
    idValidacao = dataItem.Id;

    ExibirDiv("divResultado");

    CarregarGridResultados();
}

/*Ações de GRID - Revalidação de Período*/
function RevalidarPeriodo(e) {
    var dataItem = $("#gridValidacoes").data("kendoGrid").dataItem(e.parentElement.parentElement);
    idValidacao = dataItem.Id;
    $.ajax({
        url: "/Validacoes/Revalidar?idValidacao=" + idValidacao,
        type: "POST",
        async: false,
        dataType: "json",
        cache: false,
        success: function (result) {
            if (result.Sucesso) {                
                CarregarGridValidacoes(idMatriz);
                ShowModalSucesso(result.Msg);
            }
            else
                ShowModalAlerta(result.Msg);
        }
    });

    $("#gridValidacoes").data("kendoGrid").refresh();
}

// ******** RESULTADOS **********

function CarregarGridResultados() {
    var dsGrid = undefined;

    if ($.isNumeric(idValidacao)) {
        $.ajax({
            url: "/Validacoes/PesquisarResultados?idValidacao=" + idValidacao,
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
    }
    else {
        dsGrid = undefined;
    }

    $("#gridResultados").html("");
    $("#gridResultados").kendoGrid({
        toolbar: ["excel"],
        excel: {
            fileName: 'SumarioValidacoes_' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + '.xlsx',
            allPages: true
        },
        excelExport: function (e) {
            var sheet = e.workbook.sheets[0];
            for (var rowIndex = 1; rowIndex < sheet.rows.length; rowIndex++) {
                if (rowIndex % 2 == 0) {
                    var row = sheet.rows[rowIndex];
                    for (var cellIndex = 0; cellIndex < row.cells.length; cellIndex++) {
                        row.cells[cellIndex].background = "#aabbcc";
                    }
                }
            }
        },
        dataSource: {
            data: dsGrid,
            pageSize: 10,
            sort: {
                field: "Ocorrencias",
                dir: "desc"
            }
        },
        scrollable: true,
        sortable: true,
        pageable: true,
        columns: [
            { field: "Id", hidden: true },
            { field: "Nome", title: "Campo", width: "40px" },            
            { field: "Descricao", title: "Mensagem", width: "80px" },
            { field: "Ocorrencias", title: "Ocorrências", width: "20px" },
            {
                title: "Detalhes",
                template: "<a onclick='javascript:{EditarResultado(this);}' class='k-button'>"
                    + "<span title='Visualizar Detalhes' class='glyphicon glyphicon-pencil'></span></a>",
                width: "15px",
                attributes: { style: "text-align:center;" },
                filterable: false
            }
        ]
    });
}

function EditarResultado(e) {
    var regra = $("#gridResultados").data("kendoGrid").dataItem(e.parentElement.parentElement);

    idResultado = regra.Id;
    ExibirDiv("divDetalhamentoSumario");
    CarregarGridDetalhamentoSumario(regra, false);
}

function RevalidarPeriodoAlternativo()
{
    $.ajax({
        url: "/Validacoes/RevalidarPeriodo",
        type: "POST",
        data: { 'idMatriz': idMatriz, 'idValidacao': idValidacao },
        async: false,
        dataType: "json",
        cache: false,
        success: function (result) {
            if (result.Sucesso)
                ShowModalSucesso(result.Msg);                
            else
                ShowModalAlerta(result.Msg);
        }
    });
}

// ******* DETALHAMENTO SUMÁRIO ******

function CarregarGridDetalhamentoSumario(regra, pesquisarPorRegra) {    
    var dsGridNotas = undefined;   

    $('#gridDetalhamentoSumarioNota').html("");

    if (pesquisarPorRegra) {
        $("#gridDetalhamentoSumarioNota").html("");

        $.ajax({
            url: "/Validacoes/PesquisarDetalhamentoNotaFiscalPorRegra?idRegra=" + regra.Id,
            type: "GET",
            async: false,
            dataType: "json",
            cache: false,
            success: function (result) {
                if (result.Sucesso)
                    dsGridNotas = result.Data;
                else
                    ShowModalAlerta(result.Msg);
            }
        });


    }    
    else {
        $('#gridDetalhamentoSumarioNota').html("");
        $.ajax({
            url: "/Validacoes/PesquisarDetalhamentoSumario?idSumario=" + idResultado,
            type: "GET",
            async: false,
            dataType: "json",
            cache: false,
            success: function (result) {
                if (result.Sucesso)
                    dsGridNotas = result.Data;
                else
                    ShowModalAlerta(result.Msg);
            }
        });
    }

    if (dsGridNotas != undefined) {
        $("#gridDetalhamentoSumarioNota").html("");
        $("#gridDetalhamentoSumarioNota").kendoGrid({
            toolbar: ["excel"],
            excel: {
                fileName: 'SumarioValidacoes_' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + '.xlsx',
                allPages: true
            },
            excelExport: function (e) {
                var sheet = e.workbook.sheets[0];
                for (var rowIndex = 1; rowIndex < sheet.rows.length; rowIndex++) {
                    if (rowIndex % 2 == 0) {
                        var row = sheet.rows[rowIndex];
                        for (var cellIndex = 0; cellIndex < row.cells.length; cellIndex++) {
                            row.cells[cellIndex].background = "#aabbcc";
                        }
                    }
                }
            },
            dataSource: {
                data: dsGridNotas,
                pageSize: 10,
                sort: {
                    field: "DocNum",
                    dir: "asc"
                },
                schema: {
                    model: {
                        id: "Id",
                        fields: {
                            DocNum: { type: "number", validation: { required: true } },
                            Numero: { type: "number", validation: { required: true } },
                            Serie: { type: "number", validation: { required: true } },
                            DEmi: { type: "date", validation: { required: true } },
                            DLcto: { type: "date", validation: { required: true } },
                            Movimento: { validation: { required: false } },
                            CodigoParticipante:{ validation: { required: false } },
                            RazaoSocial: { validation: { required: false } }
                        }
                    }
                }
            },
            scrollable: true,
            sortable: true,
            pageable: true,
            columns: [
                { field: "Id", hidden: true },
                { field: "DocNum", title: "DocNum", width: "80px" },
                { field: "Numero", title: "Nº NF", width: "80px" },
                { field: "Serie", title: "Série", width: "40px" },
                { field: "DEmi", title: "Data Emissão", template: "#= kendo.toString(kendo.parseDate(DEmi, 'yyyy-MM-dd'), 'dd/MM/yyyy') #", width: "80px" },
                { field: "DLcto", title: "Data Lançamento", template: "#= kendo.toString(kendo.parseDate(DLcto, 'yyyy-MM-dd'), 'dd/MM/yyyy') #", width: "80px" },
                { field: "Movimento", title: "Movimento", width: "40px" },
                { field: "CodigoParticipante", title: "Cód. Participante", width: "80px" },
                { field: "RazaoSocial", title: "Razão Social", width: "250px" },
                {
                    title: "Ocorrência por Nota",
                    template: "<a onclick='javascript:{EditarDetalhamentoNota(this);}' class='k-button'>"
                        + "<span title='Visualizar Detalhes' class='glyphicon glyphicon-pencil'></span></a>",
                    width: "100px",
                    attributes: { style: "text-align:center;" },
                    filterable: false
                }
            ]
        });
    }
  
    $('#tbRegra').val(regra.Nome);
    $('#tbDescricao').val(regra.Descricao);   
}

function UrlComParametros(metodo, nomeGrid, id) {
    var paginaAtual = 1;
    var itensPagina = 10;

    if ($(nomeGrid).data("kendoGrid") != undefined && $(nomeGrid).data("kendoGrid") != null) {
        paginaAtual = $(nomeGrid).data("kendoGrid").dataSource.page();
        itensPagina = $(nomeGrid).data("kendoGrid").dataSource.pageSize();
    }

    var params =
        '?id=' + id +
        '&numeroPagina=' + paginaAtual +
        '&linhasPagina=' + itensPagina;

    return "/Validacoes/" + metodo + "/" + params;
}

function EditarDetalhamentoNota(e) {
    notaFiscal = $("#gridDetalhamentoSumarioNota").data("kendoGrid").dataItem(e.parentElement.parentElement);
    notaFiscal.DataAtualizacao = kendo.parseDate($("#gridDetalhamentoSumarioNota").data("kendoGrid").dataItem(e.parentElement.parentElement).DataAtualizacao, 'yyyy-MM-dd');
    notaFiscal.DataEntrada = kendo.parseDate($("#gridDetalhamentoSumarioNota").data("kendoGrid").dataItem(e.parentElement.parentElement).DataEntrada, 'yyyy-MM-dd');
    notaFiscal.DEmi = kendo.parseDate($("#gridDetalhamentoSumarioNota").data("kendoGrid").dataItem(e.parentElement.parentElement).DEmi, 'yyyy-MM-dd');
    notaFiscal.DLcto = kendo.parseDate($("#gridDetalhamentoSumarioNota").data("kendoGrid").dataItem(e.parentElement.parentElement).DLcto, 'yyyy-MM-dd');

    ExibirDiv("divDetalhamentoNota");
    CarregarGridDetalhamentoNota();
}

// *********** DETALHAMENTO NOTA FISCAL **************

function CarregarCategoriasNotaFiscal() {
    var dsCategorias = undefined;

    $.ajax({
        url: "/Validacoes/BuscarCategoriasNotaFiscal",
        type: "GET",
        async: false,
        dataType: "json",
        cache: false,
        success: function (result) {
            if (result.Sucesso)
                dsCategorias = result.Data;
            else
                ShowModalAlerta(result.Msg);           
        }
    });

    $('#selectCategoria').kendoDropDownList({
        dataTextField: "Descricao",
        dataValueField: "Id",
        dataSource: dsCategorias,
        select: function (e) {
            var dataItem = this.dataItem(e.item.index());
            if (dataItem.Id == notaFiscal.Categoria.Id || notaFiscal.Editavel == false)
            {
                $('#btnSalvar').prop('disabled', true);
                $('#btnCancelar').prop('disabled', true);                
            }            
            else
            {
                $('#btnSalvar').prop('disabled', false);
                $('#btnCancelar').prop('disabled', false);
            }
            
        }
    });
}

function CarregarGridDetalhamentoNota() {
    //var dsNotaFiscal = undefined;
    var dsGridRegras = undefined;

    if ($.isNumeric(notaFiscal.Id)) {
        $.ajax({
            url: "/Validacoes/PesquisarDetalhamentoNotaFiscal?idNotaFiscal=" + notaFiscal.Id,
            type: "GET",
            async: false,
            dataType: "json",
            cache: false,
            success: function (result) {
                if (result.Sucesso) {
                    notaFiscal = result.NotaFiscal;
                    dsGridRegras = result.Regras;
                    CarregarCategoriasNotaFiscal();
                }
                else
                    ShowModalAlerta(result.Msg);
            }
        });
    }
    else {        
        dsGridRegras = undefined;
        dsNotaFiscal = undefined;
        return;
    }

    $("#tbNumeroNF").val(notaFiscal.Numero);
    $("#tbSerieNF").val(notaFiscal.Serie);
    $("#tbUF").val(notaFiscal.Estado);
    $("#tbDataDocumento").val(kendo.toString(kendo.parseDate(notaFiscal.DEmi, 'yyyy-MM-dd'), 'dd/MM/yyyy'));
    $("#tbDataLancamento").val(kendo.toString(kendo.parseDate(notaFiscal.DLcto, 'yyyy-MM-dd'), 'dd/MM/yyyy'));
   
    var selectCategoria = $("#selectCategoria").data("kendoDropDownList");
    selectCategoria.select(function (dataItem) {
        return dataItem.Id === notaFiscal.Categoria.Id;
    });

    $('#btnSalvar').prop('disabled', true);
    $('#btnCancelar').prop('disabled', true);

    if (notaFiscal.Editavel == true)
        $("#lbPeriodoFechado").text('');            
    else 
        $("#lbPeriodoFechado").text('PERÍODO FECHADO');
        
    $("#gridItensNotaFiscal").html("");
    $("#gridItensNotaFiscal").kendoGrid({
        dataSource: {
            data: notaFiscal.Itens,
            pageSize: 3,
            sort: {
                field: "NumeroItem",
                dir: "asc"
            }
        },
        scrollable: true,
        sortable: true,
        pageable: true,
        columns: [
            { field: "Id", hidden: true },            
            { field: "NumeroItem", title: "Nº Item", width: "40px" },
            { field: "DescricaoMaterial", title: "Descrição Material", width: "300px" },
            { field: "CFOP", title: "CFOP", width: "100px" },
            { field: "TotalItem", title: "Total Item", template: '#=TotalItem.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" }, width: "50px" },
            {
                title: "Detalhes",
                template: "<a  onclick='javascript:{EditarItemNota(this);}' class='k-button'>"
                    + "<span title='Editar item' class='glyphicon glyphicon-pencil'></span></a>",
                width: "45px",
                attributes: { style: "text-align:center;" },
                filterable: false
            }
        ]
    });

    $("#gridDetalhamentoNotaRegras").html("");
    $("#gridDetalhamentoNotaRegras").kendoGrid({
        dataSource: {
            data: dsGridRegras,
            pageSize: 10            
        },
        scrollable: true,
        sortable: true,
        pageable: true,
        columns: [
            { field: "Id", hidden: true },
            { field: "Nome", title: "Tipo Erro", width: "100px" },
            { field: "Descricao", title: "Descrição", width: "300px" },           
            {
                title: "Detalhes",
                template: "<a onclick='javascript:{EditarDetalheRegra(this);}' class='k-button'>"
                    + "<span title='Visualizar Detalhes' class='glyphicon glyphicon-pencil'></span></a>",
                width: "45px",
                attributes: { style: "text-align:center;" },
                filterable: false
            }
        ]
    });
}

function EditarItemNota(e) {
    itemNotaFiscal = $("#gridItensNotaFiscal").data("kendoGrid").dataItem(e.parentElement.parentElement);
    itemNotaFiscal.DataAtualizacao = kendo.parseDate($("#gridItensNotaFiscal").data("kendoGrid").dataItem(e.parentElement.parentElement).DataAtualizacao, 'yyyy-MM-dd');    
    itemNotaFiscal.DataEntrada = kendo.parseDate($("#gridItensNotaFiscal").data("kendoGrid").dataItem(e.parentElement.parentElement).DataEntrada, 'yyyy-MM-dd');

    $('#modalEditarNotaFiscalItem').modal({ backdrop: 'static', keyboard: false });    

    CarregarItemNota(itemNotaFiscal, notaFiscal.Editavel);
    VerificarNavegacaoItem();
}

function EditarDetalheRegra(e) {
    var regra = $("#gridDetalhamentoNotaRegras").data("kendoGrid").dataItem(e.parentElement.parentElement);

    //idResultado = regra.Id;
    ExibirDiv("divDetalhamentoSumario");
    CarregarGridDetalhamentoSumario(regra, true);
}

function SalvarNotaFiscal() {   
    var idCategoriaNF = parseInt($("#selectCategoria").data("kendoDropDownList").value());

    $.ajax({
        type: "POST",
        url: "/Validacoes/SalvarNotaFiscal?idDocumentoFiscal=" + notaFiscal.Id + '&idCategoria=' + idCategoriaNF,        
        contentType: "application/json",
        success: function (result) {
            if (result.Sucesso) {
                ShowModalSucesso(result.Msg);
                notaFiscal.Categoria.Id = idCategoriaNF;
                $('#btnSalvar').prop('disabled', true);
                $('#btnCancelar').prop('disabled', true);
            }
            else
                ShowModalAlerta(result.Msg);
        }
    });
}

function SalvarItemNotaFiscal() {  
    itemNotaFiscal.CFOP = $("#tbItemCFOP").val();
    itemNotaFiscal.CFOPRef = $("#tbItemCFOPReferencia").val();
    itemNotaFiscal.GrupoMercadoria = $("#tbItemGrupoMaterial").val();
    itemNotaFiscal.DescricaoMaterial = $("#tbItemDescricaoMaterial").val();
    itemNotaFiscal.BaseICMS = parseFloat($("#tbItemBaseCalculoICMS").val().replace(/\./g, '').replace(",", "."));
    itemNotaFiscal.TotalItem = parseFloat($("#tbItemTotalItem").val().replace(/\./g, '').replace(",", "."));

    $.ajax({
        type: "POST",
        url: "/Validacoes/SalvarItemNotaFiscal",
        data: JSON.stringify({ itemNotaFiscal: itemNotaFiscal }),
        contentType: "application/json",
        success: function (result) {
            if (result.Sucesso) {
                ShowModalSucesso(result.Msg);
                CarregarGridDetalhamentoNota();
            }
            else
                ShowModalAlerta(result.Msg);
        }
    });
}

function CancelarAlteracaoNotaFiscal() {
    var selectCategoria = $("#selectCategoria").data("kendoDropDownList");
    selectCategoria.select(function (dataItem) {
        return dataItem.Id === notaFiscal.Categoria.Id;
    });

    $('#btnSalvar').prop('disabled', true);
    $('#btnCancelar').prop('disabled', true);
}

function VerificarNavegacaoItem() {
    $("#btnItemAnterior").hide();
    $("#btnItemProximo").hide();

    if(notaFiscal.Itens[0].Id != itemNotaFiscal.Id) {
        $("#btnItemAnterior").show();
    }

    if (notaFiscal.Itens.slice(-1)[0].Id != itemNotaFiscal.Id) {
        $("#btnItemProximo").show();
    }
}

function MoverItemAnterior() {
    var indice;

    notaFiscal.Itens.some(function (entry, i) {
        if (entry.Id == itemNotaFiscal.Id) {
            indice = i;
            return true;
        }
    });

    itemNotaFiscal = notaFiscal.Itens[indice - 1];
    CarregarItemNota(itemNotaFiscal, notaFiscal.Editavel);
    VerificarNavegacaoItem();
}

function MoverItemProximo() {
    var indice;

    notaFiscal.Itens.some(function (entry, i) {
        if (entry.Id == itemNotaFiscal.Id) {
            indice = i;
            return true;
        }
    });

    itemNotaFiscal = notaFiscal.Itens[indice + 1];
    CarregarItemNota(itemNotaFiscal, notaFiscal.Editavel);
    VerificarNavegacaoItem();
}

function CarregarItemNota(itemNotaFiscal, editavel) {
    $("#tbItemId").val(itemNotaFiscal.Id);
    $("#tbItemNumero").val(itemNotaFiscal.NumeroItem);
    $("#tbItemCFOP").val(itemNotaFiscal.CFOP)
    $("#tbItemCFOPReferencia").val(itemNotaFiscal.CFOPRef)
    $("#tbItemGrupoMaterial").val(itemNotaFiscal.GrupoMercadoria);
    $("#tbItemDescricaoMaterial").val(itemNotaFiscal.DescricaoMaterial);
    $("#tbItemBaseCalculoICMS").val(itemNotaFiscal.BaseICMS.FormatarMoeda(2, '', '.', ','));
    $("#tbItemTotalItem").val(itemNotaFiscal.TotalItem.FormatarMoeda(2, '', '.', ','));

    if (editavel == true) {
        $("#lbPeriodoFechadoItem").text('');
        $('#btnSalvarItem').prop('disabled', false);
    }
    else {
        $("#lbPeriodoFechadoItem").text('PERÍODO FECHADO');
        $('#btnSalvarItem').prop('disabled', true);
    }    
}

// ******** GERAL ************

function ExibirDiv(div) {
    switch (div) {
        case "divValidacoes":
            $('#divValidacoes').show();
            $('#divResultado').hide();
            $('#divDetalhamentoSumario').hide();
            $('#divDetalhamentoNota').hide();
            CarregarGridValidacoes(idMatriz);
            break;
        case "divResultado":
            $('#divValidacoes').hide();
            $('#divResultado').show();
            $('#divDetalhamentoSumario').hide();
            $('#divDetalhamentoNota').hide();
            break;
        case "divDetalhamentoSumario":
            $('#divValidacoes').hide();
            $('#divResultado').hide();
            $('#divDetalhamentoSumario').show();
            $('#divDetalhamentoNota').hide();
            break;
        case "divDetalhamentoNota":
            $('#divValidacoes').hide();
            $('#divResultado').hide();
            $('#divDetalhamentoSumario').hide();
            $('#divDetalhamentoNota').show();
            break;
    }
}

