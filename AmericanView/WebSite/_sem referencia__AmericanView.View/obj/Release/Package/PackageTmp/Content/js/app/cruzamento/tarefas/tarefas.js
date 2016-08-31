var idMatriz = 0;

$(document).ready(function () {
    InitializeComponents();
});

function InitializeComponents() {
    CarregarMatrizes();

    $('#btnPesquisar').click(function () {
        CarregarGridTarefas();
    });

    $('#btnLimparPequisa').click(function () {
        var selectMatriz = $("#selectMatriz").data("kendoDropDownList");
        selectMatriz.select(0);
        $('#tbRazaoSocial').val('');
        idMatriz = 0;
        CarregarGridTarefas();
    });
}

function CarregarGridTarefas() {
    gridDs_load(idMatriz);
    setInterval(function () {
        $('#grid').data('kendoGrid').dataSource.read();
    }, 15000);
}

function gridDs_load(idMatrizSelecionada) {
    $("#grid").html("");
    $("#grid").kendoGrid({
        dataSource: {
            schema: {
                data: function(result){
                    return result.data;
                },
                total: function(result){
                    return result.total;
                },
                model: {
                    id: "Id",
                    fields: {
                        NomeArquivo: { type: "string" },
                        Status: { type: "string" },
                        StatusId: { type: "number" },
                        PeriodoInicial: { type: "datetime" },
                        PeriodoFinal: { type: "datetime" },
                        DataCarga: { type: "datetime" }
                    }
                }
            },
            transport: {
                read: {
                    url: "Tarefas/Get",
                    dataType: "json",
                    type: "GET",
                    async: true,//não aguardamos a busca
                    cache: false
                },
                parameterMap: function (data, type) {
                    if (type == "read") {
                        return { idMatriz: idMatrizSelecionada }
                    }
                }
            },
            pageSize: 10
        },
        scrollable: true,
        sortable: true,
        filterable: true,
        resizable: true,
        groupable: false,
        pageable: {
            pageSizes: [10, 25, 50]
        },        
        columns: [
            { field: "Id", hidden: true },
            {
                field: "StatusId",
                title: " ",
                width: "15%",
                filterable: false,
                template: "<button class='k-button' onclick='javascript:{ReprocessarCruzamento(this);}' #= (StatusId != 3) ? 'disabled' : '' #>Reprocessar Cruzamento</button>",
                attributes: { style: "text-align:center;" }
            },
            { width: '35%', field: "NomeArquivo", title: "Nome do Arquivo" },
            { width: '15%', field: "PeriodoInicial", title: "Período", template: "#if(PeriodoInicial == null) {# &nbsp; #} else {# #=kendo.toString(kendo.parseDate(PeriodoInicial), 'dd/MM/yyyy HH:mm:ss')# #} #" },
            { width: '15%', field: "DataCarga", title: "Data da Carga", template: "#=kendo.toString(kendo.parseDate(DataCarga), 'dd/MM/yyyy HH:mm:ss')#" },
            { width: '10%', field: "Status", title: "Status" },
            { width: '10%', field: "Id", title: "Detalhes", template: kendo.template($("#scrTarefasColAction").html()), attributes: { style: "text-align:center;" } }
        ]
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

/*Realizar o Pedido para Realizar o Cruzamento Novamente*/
function ReprocessarCruzamento(e) {
    var dataItem = $("#grid").data("kendoGrid").dataItem(e.parentElement.parentElement);
    var idControle = dataItem.Id;

    $.ajax({
        url: "/Tarefas/ReprocessarCruzamento?idCruzamento=" + idControle,
        type: "POST",
        async: false,
        dataType: "json",
        cache: false,
        success: function (result) {
            if (result.Sucesso)
                $("#grid").data("kendoGrid").dataSource.read();
        }
    });    
}