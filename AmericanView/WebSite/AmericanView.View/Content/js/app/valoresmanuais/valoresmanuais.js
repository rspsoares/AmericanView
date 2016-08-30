var dsLancamentosOriginal = [];
var dsLancamentosAlterado = [];
var idMatriz = 0;

function CarregarComponentes() {
    CarregarMatrizes();
    
    $('#btnPesquisar').click(function () {
        CarregarGridLancamentos(idMatriz);      
    });

    $('#btnLimparPequisa').click(function () {
        var selectMatriz = $("#selectMatriz").data("kendoDropDownList");
        selectMatriz.select(0);
        $('#tbRazaoSocial').val('');      
        idMatriz = 0;
        CarregarGridLancamentos(idMatriz);
    });

    $("#tabstrip").kendoTabStrip({
        animation: {
            open: {
                effects: "fade"
            }
        }
    });
   
    ConfigurarEventosValoresMoeda();   
}

function ConfigurarEventosValoresMoeda() {   
    $('input[type="text"]').on('blur', function() {
        var regex = /^[0-9]+([\,\.][0-9]+)?$/g;
        if (regex.test($(this).val().replace(".", "")))
            $(this).val(parseFloat($(this).val().replace(".", "").replace(",", ".")).FormatarMoeda(2, '', '.', ','));
        else
            $(this).val("0,00");
    });

    $('input[type="text"]').on('keypress', function (e) {
        if (e.which != 8 && e.which != 0 && e.which != 44 && (e.which < 48 || e.which > 57)) return false;
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

function CarregarGridLancamentos(idMatriz) {
    var dsGrid = [];

    if ($.isNumeric(idMatriz)) {
        $.ajax({
            url: "/ValoresManuais/Pesquisar?idMatriz=" + idMatriz,
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

    $("#gridValoresManual").html("");
    var gridValoresManual =
        $("#gridValoresManual").kendoGrid({
            toolbar: ["excel"],
            excel: {
                fileName: 'ValoresManuais_' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + '.xlsx',
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
                    field: "AnoMes",
                    dir: "desc"
                }
            },
            scrollable: true,
            sortable: true,
            pageable: true,
            columns: [
                { field: "Id", hidden: true },
                { field: "Editavel", hidden: true },
                { field: "AnoMes", title: "Período", width: "80px", locked: true },
                {
                    title: "Editar",
                    template: "<button class='k-button' onclick='javascript:{EditarValores(this);}' #= (Editavel == 0) ? 'disabled' : '' #>"                        
                            + "<span title='Visualizar Resumo' class='glyphicon glyphicon-pencil'></span></a>",
                    width: "120px",
                    attributes: { style: "text-align:center;" },
                    filterable: false
                },
                { field: "Importacao", title: "Importação", width: "120px", template: '#=Importacao.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
                { field: "Creditosobreencargosdedepreciacao", width: "120px", title: "Crédito sobre encargos de depreciação", template: '#=Creditosobreencargosdedepreciacao.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
                { field: "Contasareceberentrecompanhia", width: "120px", title: "Contas a receber entre Companhias", template: '#=Contasareceberentrecompanhia.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
                { field: "EquivalenciaPatrimonial", width: "120px", title: "Equivalência Patrimonial", template: '#=EquivalenciaPatrimonial.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
                { field: "OutrasReceitasOperacionais", width: "120px", title: "Outras Receitas Operacionais", template: '#=OutrasReceitasOperacionais.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
                { field: "JurosCapitalProprio", width: "120px", title: "Juros Capital Próprio", template: '#=JurosCapitalProprio.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
                { field: "ReceitasFinanceirasTributadaAliquotaDiferenciada", width: "120px", title: "Receitas Financeiras Tributada Alíq. Diferenciada", template: '#=ReceitasFinanceirasTributadaAliquotaDiferenciada.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
                { field: "VariacaoCambialTributadaAliquotaDiferenciada", width: "120px", title: "Variação Cambial Tributada Alíq. Diferenciada", template: '#=VariacaoCambialTributadaAliquotaDiferenciada.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
                { field: "ReceitasFinanceirasTributadaAliquotaZero", width: "120px", title: "Receitas Financeiras Tributada Alíq. Zero", template: '#=ReceitasFinanceirasTributadaAliquotaZero.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
                { field: "VariacaoCambialTributadaAliquotaZero", width: "120px", title: "Variação Cambial Tributada Alíq. Zero", template: '#=VariacaoCambialTributadaAliquotaZero.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
                { field: "AquisicaodeBens", width: "120px", title: "Aquisição de Bens", template: '#=AquisicaodeBens.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
                { field: "CreditosobreEncargodeDepreciacao", width: "120px", title: "Credito sobre Encargo de Depreciação", template: '#=CreditosobreEncargodeDepreciacao.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
                { field: "Creditosobrevalordeaquisicao", width: "120px", title: "Credito sobre valor de Aquisicao", template: '#=Creditosobrevalordeaquisicao.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
                { field: "PISRetido", width: "120px", title: "PIS Retido", template: '#=PISRetido.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
                { field: "CofinsRetido", width: "120px", title: "Cofins Retido", template: '#=CofinsRetido.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },                
                { field: "ReceitadeComissaoeServicosIntercompany", width: "120px", title: "Receita de Comissão e Servicos Intercompany", template: '#=ReceitadeComissaoeServicosIntercompany.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
                { field: "ReceitadeServicosInterCompanhias", width: "120px", title: "Receita de Servicos InterCompanhias", template: '#=ReceitadeServicosInterCompanhias.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } }
            ]
        }).data("kendoGrid");

    gridValoresManual.thead.kendoTooltip({
        filter: "th",
        content: function (e) {
            var target = e.target;
            return $(target).text();
        }
    });
}

function EditarValores(e) {
    var dataHtml = '';
    var dataItem = $("#gridValoresManual").data("kendoGrid").dataItem(e.parentElement.parentElement);

    dsLancamentosOriginal = dataItem;

    CarregarDadosLancamento(dsLancamentosOriginal);

    CarregarGridHistorico(dsLancamentosOriginal.Id);
    CarregarPopUpLancamento();
}

function CarregarPopUpLancamento() {
    $('#modalEditarValores').modal({ backdrop: 'static', keyboard: false });
    $('#modalEditarValores .modal-dialog .modal-header center .modal-title strong').html("");
    $('#modalEditarValores .modal-dialog .modal-header center .modal-title strong').html('Inserção Manual de Valores');
}

function CarregarDadosLancamento(dataItem) {   
    // Cabeçalho
    $("#tbMatriz").val($("#selectMatriz").data("kendoDropDownList").text());   
    $("#tbRazaoSocial2").val($("#tbRazaoSocial").val());
    $("#tbPeriodo").val(dataItem.AnoMes);
    $("#tbPeriodo").attr("readonly", true);
    $('input[name="tbPeriodo"]').css('font-weight', 'bold');

    //Receita
    $("#tbImportacao").val(dataItem.Importacao.FormatarMoeda(2, '', '.', ','));
    $("#tbDepreciacao").val(dataItem.Creditosobreencargosdedepreciacao.FormatarMoeda(2, '', '.', ','));
    $("#tbContasareceberentrecompanhia").val(dataItem.Contasareceberentrecompanhia.FormatarMoeda(2, '', '.', ','));
    $("#tbReceitadeServicosInterCompanhias").val(dataItem.ReceitadeServicosInterCompanhias.FormatarMoeda(2, '', '.', ','));
    $("#tbReceitadeComissaoeServicosIntercompany").val(dataItem.ReceitadeComissaoeServicosIntercompany.FormatarMoeda(2, '', '.', ','));
    $("#tbAquisicaodeBens").val(dataItem.AquisicaodeBens.FormatarMoeda(2, '', '.', ','));

    //Crédito
    $("#tbEquivalencia").val(dataItem.EquivalenciaPatrimonial.FormatarMoeda(2, '', '.', ','));
    $("#tbOutrasReceitas").val(dataItem.OutrasReceitasOperacionais.FormatarMoeda(2, '', '.', ','));
    $("#tbJurosCapital").val(dataItem.JurosCapitalProprio.FormatarMoeda(2, '', '.', ','));
    $("#tbReceitaAliqDif").val(dataItem.ReceitasFinanceirasTributadaAliquotaDiferenciada.FormatarMoeda(2, '', '.', ','));
    $("#tbVariacaoCambialAliqDif").val(dataItem.VariacaoCambialTributadaAliquotaDiferenciada.FormatarMoeda(2, '', '.', ','));
    $("#tbReceitaAliqZero").val(dataItem.ReceitasFinanceirasTributadaAliquotaZero.FormatarMoeda(2, '', '.', ','));
    $("#tbVariacaoCambialAliqZero").val(dataItem.VariacaoCambialTributadaAliquotaZero.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditosobrevalordeaquisicao").val(dataItem.Creditosobrevalordeaquisicao.FormatarMoeda(2, '', '.', ','));
    $("#tbPISRetido").val(dataItem.PISRetido.FormatarMoeda(2, '', '.', ','));
    $("#tbCofinsRetido").val(dataItem.CofinsRetido.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditosobreEncargodeDepreciacao").val(dataItem.CreditosobreEncargodeDepreciacao.FormatarMoeda(2, '', '.', ','));

    //Utilização de Créditos Acumulados
    $("#tbSaldodeCreditoComPedidodeRessarcimentoNaoCompensado_PIS").val(dataItem.SaldodeCreditoComPedidodeRessarcimentoNaoCompensado_PIS.FormatarMoeda(2, '', '.', ','));
    $("#tbSaldodeCreditoComPedidodeRessarcimentoNaoCompensado_COFINS").val(dataItem.SaldodeCreditoComPedidodeRessarcimentoNaoCompensado_COFINS.FormatarMoeda(2, '', '.', ','));

    $("#tbCreditoObjetoPedidoRessarcimentoMes_Natureza101_PIS").val(dataItem.CreditoObjetoPedidoRessarcimentoMes_Natureza101_PIS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoObjetoPedidoRessarcimentoMes_Natureza101_COFINS").val(dataItem.CreditoObjetoPedidoRessarcimentoMes_Natureza101_COFINS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoObjetoPedidoRessarcimentoMes_Natureza201_PIS").val(dataItem.CreditoObjetoPedidoRessarcimentoMes_Natureza201_PIS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoObjetoPedidoRessarcimentoMes_Natureza201_COFINS").val(dataItem.CreditoObjetoPedidoRessarcimentoMes_Natureza201_COFINS.FormatarMoeda(2, '', '.', ','));    
    $("#tbCreditoObjetoPedidoRessarcimentoMes_Natureza301_PIS").val(dataItem.CreditoObjetoPedidoRessarcimentoMes_Natureza301_PIS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoObjetoPedidoRessarcimentoMes_Natureza301_COFINS").val(dataItem.CreditoObjetoPedidoRessarcimentoMes_Natureza301_COFINS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoObjetoPedidoRessarcimentoMes_Natureza108_PIS").val(dataItem.CreditoObjetoPedidoRessarcimentoMes_Natureza108_PIS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoObjetoPedidoRessarcimentoMes_Natureza108_COFINS").val(dataItem.CreditoObjetoPedidoRessarcimentoMes_Natureza108_COFINS.FormatarMoeda(2, '', '.', ','));    
    $("#tbCreditoObjetoPedidoRessarcimentoMes_Natureza208_PIS").val(dataItem.CreditoObjetoPedidoRessarcimentoMes_Natureza208_PIS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoObjetoPedidoRessarcimentoMes_Natureza208_COFINS").val(dataItem.CreditoObjetoPedidoRessarcimentoMes_Natureza208_COFINS.FormatarMoeda(2, '', '.', ','));    
    $("#tbCreditoObjetoPedidoRessarcimentoMes_Natureza308_PIS").val(dataItem.CreditoObjetoPedidoRessarcimentoMes_Natureza308_PIS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoObjetoPedidoRessarcimentoMes_Natureza308_COFINS").val(dataItem.CreditoObjetoPedidoRessarcimentoMes_Natureza308_COFINS.FormatarMoeda(2, '', '.', ','));

    $("#tbCreditoCompensadoMes_Natureza101_PIS").val(dataItem.CreditoCompensadoMes_Natureza101_PIS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoCompensadoMes_Natureza101_COFINS").val(dataItem.CreditoCompensadoMes_Natureza101_COFINS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoCompensadoMes_Natureza201_PIS").val(dataItem.CreditoCompensadoMes_Natureza201_PIS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoCompensadoMes_Natureza201_COFINS").val(dataItem.CreditoCompensadoMes_Natureza201_COFINS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoCompensadoMes_Natureza301_PIS").val(dataItem.CreditoCompensadoMes_Natureza301_PIS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoCompensadoMes_Natureza301_COFINS").val(dataItem.CreditoCompensadoMes_Natureza301_COFINS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoCompensadoMes_Natureza108_PIS").val(dataItem.CreditoCompensadoMes_Natureza108_PIS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoCompensadoMes_Natureza108_COFINS").val(dataItem.CreditoCompensadoMes_Natureza108_COFINS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoCompensadoMes_Natureza208_PIS").val(dataItem.CreditoCompensadoMes_Natureza208_PIS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoCompensadoMes_Natureza208_COFINS").val(dataItem.CreditoCompensadoMes_Natureza208_COFINS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoCompensadoMes_Natureza308_PIS").val(dataItem.CreditoCompensadoMes_Natureza308_PIS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoCompensadoMes_Natureza308_COFINS").val(dataItem.CreditoCompensadoMes_Natureza308_COFINS.FormatarMoeda(2, '', '.', ','));
    
    $("#tbCreditoDescontadoMes_Natureza101_PIS").val(dataItem.CreditoDescontadoMes_Natureza101_PIS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoDescontadoMes_Natureza101_COFINS").val(dataItem.CreditoDescontadoMes_Natureza101_COFINS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoDescontadoMes_Natureza201_PIS").val(dataItem.CreditoDescontadoMes_Natureza201_PIS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoDescontadoMes_Natureza201_COFINS").val(dataItem.CreditoDescontadoMes_Natureza201_COFINS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoDescontadoMes_Natureza301_PIS").val(dataItem.CreditoDescontadoMes_Natureza301_PIS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoDescontadoMes_Natureza301_COFINS").val(dataItem.CreditoDescontadoMes_Natureza301_COFINS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoDescontadoMes_Natureza108_PIS").val(dataItem.CreditoDescontadoMes_Natureza108_PIS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoDescontadoMes_Natureza108_COFINS").val(dataItem.CreditoDescontadoMes_Natureza108_COFINS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoDescontadoMes_Natureza208_PIS").val(dataItem.CreditoDescontadoMes_Natureza208_PIS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoDescontadoMes_Natureza208_COFINS").val(dataItem.CreditoDescontadoMes_Natureza208_COFINS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoDescontadoMes_Natureza308_PIS").val(dataItem.CreditoDescontadoMes_Natureza308_PIS.FormatarMoeda(2, '', '.', ','));
    $("#tbCreditoDescontadoMes_Natureza308_COFINS").val(dataItem.CreditoDescontadoMes_Natureza308_COFINS.FormatarMoeda(2, '', '.', ','));
}



function CarregarGridHistorico(idLancamento) {
    var dsGrid = undefined;

    $("#labelHistorico").show();

    $.ajax({
        url: "/ValoresManuais/ObterLog?idLancamento=" + idLancamento,
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

    $("#gridHistricoAlteracoes").html("");
    $("#gridHistricoAlteracoes").kendoGrid({
        dataSource: {
            data: dsGrid,
            pageSize: 3,
            sort: {
                field: "DtOcorrencia",
                dir: "desc"
            }
        },
        scrollable: true,
        resizable: true,
        sortable: true,
        pageable: true,
        columns: [
            { field: "DtOcorrencia", title: "Data", template: "#= kendo.toString(kendo.parseDate(DtOcorrencia, 'yyyy-MM-dd HH:mm:ss'), 'dd/MM/yyyy HH:mm:ss') #" },
            { field: "Usuario", title: "Usuário" },
            { field: "Campo", title: "Campo Modificado" },
            { field: "ValorAnterior", title: "Valor", template: '#=ValorAnterior.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } }
        ]
    });
}

function SalvarValores() {
    PopularObjeto();

    Alterar();

    dsLancamentosOriginal = [];
    dsLancamentosAlterado = [];

    CarregarGridLancamentos(idMatriz);
}

function PopularObjeto() {
    dsLancamentosAlterado = [];

    dsLancamentosAlterado = {
        Id: dsLancamentosOriginal.Id,
        IdEmpresa: idMatriz,
        Editavel: dsLancamentosOriginal.Editavel,
        AnoMes: parseInt($("#tbPeriodo").val()),
        Importacao: parseFloat($("#tbImportacao").val().replace(/\./g, '').replace(",", ".")),
        Creditosobreencargosdedepreciacao: parseFloat($("#tbDepreciacao").val().replace(/\./g, '').replace(",", ".")),
        EquivalenciaPatrimonial: parseFloat($("#tbEquivalencia").val().replace(/\./g, '').replace(",", ".")),
        OutrasReceitasOperacionais: parseFloat($("#tbOutrasReceitas").val().replace(/\./g, '').replace(",", ".")),
        JurosCapitalProprio: parseFloat($("#tbJurosCapital").val().replace(/\./g, '').replace(",", ".")),
        ReceitasFinanceirasTributadaAliquotaDiferenciada: parseFloat($("#tbReceitaAliqDif").val().replace(/\./g, '').replace(",", ".")),
        VariacaoCambialTributadaAliquotaDiferenciada: parseFloat($("#tbVariacaoCambialAliqDif").val().replace(/\./g, '').replace(",", ".")),
        ReceitasFinanceirasTributadaAliquotaZero: parseFloat($("#tbReceitaAliqZero").val().replace(/\./g, '').replace(",", ".")),
        VariacaoCambialTributadaAliquotaZero: parseFloat($("#tbVariacaoCambialAliqZero").val().replace(/\./g, '').replace(",", ".")),
        Contasareceberentrecompanhia: parseFloat($("#tbContasareceberentrecompanhia").val().replace(/\./g, '').replace(",", ".")),
        ReceitadeComissaoeServicosIntercompany: parseFloat($("#tbReceitadeComissaoeServicosIntercompany").val().replace(/\./g, '').replace(",", ".")),
        Creditosobrevalordeaquisicao: parseFloat($("#tbCreditosobrevalordeaquisicao").val().replace(/\./g, '').replace(",", ".")),
        CreditosobreEncargodeDepreciacao: parseFloat($("#tbCreditosobreEncargodeDepreciacao").val().replace(/\./g, '').replace(",", ".")),        
        PISRetido: parseFloat($("#tbPISRetido").val().replace(/\./g, '').replace(",", ".")),
        CofinsRetido: parseFloat($("#tbCofinsRetido").val().replace(/\./g, '').replace(",", ".")),
        ReceitadeServicosInterCompanhias: parseFloat($("#tbReceitadeServicosInterCompanhias").val().replace(/\./g, '').replace(",", ".")),
        AquisicaodeBens: parseFloat($("#tbAquisicaodeBens").val().replace(/\./g, '').replace(",", ".")),

        SaldodeCreditoComPedidodeRessarcimentoNaoCompensado_PIS: parseFloat($("#tbSaldodeCreditoComPedidodeRessarcimentoNaoCompensado_PIS").val().replace(/\./g, '').replace(",", ".")),
        SaldodeCreditoComPedidodeRessarcimentoNaoCompensado_COFINS: parseFloat($("#tbSaldodeCreditoComPedidodeRessarcimentoNaoCompensado_COFINS").val().replace(/\./g, '').replace(",", ".")),

        CreditoObjetoPedidoRessarcimentoMes_Natureza101_PIS: parseFloat($("#tbCreditoObjetoPedidoRessarcimentoMes_Natureza101_PIS").val().replace(/\./g, '').replace(",", ".")),
        CreditoObjetoPedidoRessarcimentoMes_Natureza101_COFINS: parseFloat($("#tbCreditoObjetoPedidoRessarcimentoMes_Natureza101_COFINS").val().replace(/\./g, '').replace(",", ".")),
        CreditoObjetoPedidoRessarcimentoMes_Natureza201_PIS: parseFloat($("#tbCreditoObjetoPedidoRessarcimentoMes_Natureza201_PIS").val().replace(/\./g, '').replace(",", ".")),
        CreditoObjetoPedidoRessarcimentoMes_Natureza201_COFINS: parseFloat($("#tbCreditoObjetoPedidoRessarcimentoMes_Natureza201_COFINS").val().replace(/\./g, '').replace(",", ".")),
        CreditoObjetoPedidoRessarcimentoMes_Natureza301_PIS: parseFloat($("#tbCreditoObjetoPedidoRessarcimentoMes_Natureza301_PIS").val().replace(/\./g, '').replace(",", ".")),
        CreditoObjetoPedidoRessarcimentoMes_Natureza301_COFINS: parseFloat($("#tbCreditoObjetoPedidoRessarcimentoMes_Natureza301_COFINS").val().replace(/\./g, '').replace(",", ".")),
        CreditoObjetoPedidoRessarcimentoMes_Natureza108_PIS: parseFloat($("#tbCreditoObjetoPedidoRessarcimentoMes_Natureza108_PIS").val().replace(/\./g, '').replace(",", ".")),
        CreditoObjetoPedidoRessarcimentoMes_Natureza108_COFINS: parseFloat($("#tbCreditoObjetoPedidoRessarcimentoMes_Natureza108_COFINS").val().replace(/\./g, '').replace(",", ".")),
        CreditoObjetoPedidoRessarcimentoMes_Natureza208_PIS: parseFloat($("#tbCreditoObjetoPedidoRessarcimentoMes_Natureza208_PIS").val().replace(/\./g, '').replace(",", ".")),
        CreditoObjetoPedidoRessarcimentoMes_Natureza208_COFINS: parseFloat($("#tbCreditoObjetoPedidoRessarcimentoMes_Natureza208_COFINS").val().replace(/\./g, '').replace(",", ".")),
        CreditoObjetoPedidoRessarcimentoMes_Natureza308_PIS: parseFloat($("#tbCreditoObjetoPedidoRessarcimentoMes_Natureza308_PIS").val().replace(/\./g, '').replace(",", ".")),
        CreditoObjetoPedidoRessarcimentoMes_Natureza308_COFINS: parseFloat($("#tbCreditoObjetoPedidoRessarcimentoMes_Natureza308_COFINS").val().replace(/\./g, '').replace(",", ".")),

        CreditoCompensadoMes_Natureza101_PIS: parseFloat($("#tbCreditoCompensadoMes_Natureza101_PIS").val().replace(/\./g, '').replace(",", ".")),
        CreditoCompensadoMes_Natureza101_COFINS: parseFloat($("#tbCreditoCompensadoMes_Natureza101_COFINS").val().replace(/\./g, '').replace(",", ".")),
        CreditoCompensadoMes_Natureza201_PIS: parseFloat($("#tbCreditoCompensadoMes_Natureza201_PIS").val().replace(/\./g, '').replace(",", ".")),
        CreditoCompensadoMes_Natureza201_COFINS: parseFloat($("#tbCreditoCompensadoMes_Natureza201_COFINS").val().replace(/\./g, '').replace(",", ".")),
        CreditoCompensadoMes_Natureza301_PIS: parseFloat($("#tbCreditoCompensadoMes_Natureza301_PIS").val().replace(/\./g, '').replace(",", ".")),
        CreditoCompensadoMes_Natureza301_COFINS: parseFloat($("#tbCreditoCompensadoMes_Natureza301_COFINS").val().replace(/\./g, '').replace(",", ".")),
        CreditoCompensadoMes_Natureza108_PIS: parseFloat($("#tbCreditoCompensadoMes_Natureza108_PIS").val().replace(/\./g, '').replace(",", ".")),
        CreditoCompensadoMes_Natureza108_COFINS: parseFloat($("#tbCreditoCompensadoMes_Natureza108_COFINS").val().replace(/\./g, '').replace(",", ".")),
        CreditoCompensadoMes_Natureza208_PIS: parseFloat($("#tbCreditoCompensadoMes_Natureza208_PIS").val().replace(/\./g, '').replace(",", ".")),
        CreditoCompensadoMes_Natureza208_COFINS: parseFloat($("#tbCreditoCompensadoMes_Natureza208_COFINS").val().replace(/\./g, '').replace(",", ".")),
        CreditoCompensadoMes_Natureza308_PIS: parseFloat($("#tbCreditoCompensadoMes_Natureza308_PIS").val().replace(/\./g, '').replace(",", ".")),
        CreditoCompensadoMes_Natureza308_COFINS: parseFloat($("#tbCreditoCompensadoMes_Natureza308_COFINS").val().replace(/\./g, '').replace(",", ".")),

        CreditoDescontadoMes_Natureza101_PIS: parseFloat($("#tbCreditoDescontadoMes_Natureza101_PIS").val().replace(/\./g, '').replace(",", ".")),
        CreditoDescontadoMes_Natureza101_COFINS: parseFloat($("#tbCreditoDescontadoMes_Natureza101_COFINS").val().replace(/\./g, '').replace(",", ".")),
        CreditoDescontadoMes_Natureza201_PIS: parseFloat($("#tbCreditoDescontadoMes_Natureza201_PIS").val().replace(/\./g, '').replace(",", ".")),
        CreditoDescontadoMes_Natureza201_COFINS: parseFloat($("#tbCreditoDescontadoMes_Natureza201_COFINS").val().replace(/\./g, '').replace(",", ".")),
        CreditoDescontadoMes_Natureza301_PIS: parseFloat($("#tbCreditoDescontadoMes_Natureza301_PIS").val().replace(/\./g, '').replace(",", ".")),
        CreditoDescontadoMes_Natureza301_COFINS: parseFloat($("#tbCreditoDescontadoMes_Natureza301_COFINS").val().replace(/\./g, '').replace(",", ".")),
        CreditoDescontadoMes_Natureza108_PIS: parseFloat($("#tbCreditoDescontadoMes_Natureza108_PIS").val().replace(/\./g, '').replace(",", ".")),
        CreditoDescontadoMes_Natureza108_COFINS: parseFloat($("#tbCreditoDescontadoMes_Natureza108_COFINS").val().replace(/\./g, '').replace(",", ".")),
        CreditoDescontadoMes_Natureza208_PIS: parseFloat($("#tbCreditoDescontadoMes_Natureza208_PIS").val().replace(/\./g, '').replace(",", ".")),
        CreditoDescontadoMes_Natureza208_COFINS: parseFloat($("#tbCreditoDescontadoMes_Natureza208_COFINS").val().replace(/\./g, '').replace(",", ".")),
        CreditoDescontadoMes_Natureza308_PIS: parseFloat($("#tbCreditoDescontadoMes_Natureza308_PIS").val().replace(/\./g, '').replace(",", ".")),
        CreditoDescontadoMes_Natureza308_COFINS: parseFloat($("#tbCreditoDescontadoMes_Natureza308_COFINS").val().replace(/\./g, '').replace(",", "."))
    };
}

function Alterar() {
    $("#loading-page").show();

    $.ajax({
        url: '/ValoresManuais/Alterar',
        data: JSON.stringify({ lancamentoOriginal: dsLancamentosOriginal, lancamentoAlterado: dsLancamentosAlterado }),
        type: 'POST',
        async: false,
        contentType: 'application/json; charset=utf-8',
        success: function (result) {
            if (result.Sucesso) {
                $("#loading-page").hide();
                ShowModalSucesso(result.Msg);
            }
            else {
                $("#loading-page").hide();
                ShowModalAlerta("A alteração não efetivada porque " + result.Msg);
            }
        }
    });
}