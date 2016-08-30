var dsStatus = [];

function CarregarComponentes() {
    CarregarGridIntegracoes();    
    CarregarGridInfraestrutura();
    RefreshGrids();
}

function CarregarGridIntegracoes() {
    $('#gridIntegracoes').html("");
    $('#gridIntegracoes').kendoGrid({
        dataSource: {
            schema: {
                data: function (result) {
                    return result.Data;
                },
                total: function (result) {
                    return result.Total;
                }
            },
            transport: {
                read: {
                    url: "/Home/StatusIntegracoes",
                    dataType: "json",
                    type: "GET",
                    async: true,
                    cache: false
                }               
            },
            pageSize: 5
        },
        dataBound: function (e) {            
            if (this._data.length > 0) {
                var items = this._data;
                var tableRows = $(this.table).find("tr");
                tableRows.each(function (index) {
                    var row = $(this);
                    if (row[0].innerHTML.substring(1, 3) != "th") {
                        var item = items[index - 1];
                        row.addClass(RetornarCorLinha(item.Status));
                    }
                });
            }
        },
        filterable: false,
        groupable: false,
        scrollable: false,
        pageable: {
            pageSizes: [5,10, 25, 50]
        },        
        columns: [           
            { field: "monitoramentoStatus", hidden: true },
            {
                 headerTemplate: "<strong>Status</strong>",
                 template: "<center><a onclick='javascript:{ExibirDetalhesStatus(this);}' class='k-button'>" +
                     "<span title='Visualizar' class='glyphicon glyphicon-search'></span></a></center>",
                 width: "5%"
            },
            {
                field: "Cliente",
                headerTemplate: "<strong>Cliente</strong>",              
                width: "70%"
            },
            {
                field: "QtdHoje",
                headerTemplate: "<strong>Qtd dia</strong>",           
                width: "10%"
            },
            {
                field: "UltimaIntegracao",
                headerTemplate: "<strong>Últ. integração</strong>",            
                template: "#=FormatDateKendo(UltimaIntegracao) #",
                width: "15%"
            }
        ]
    });      
}

function RetornarCorLinha(status)
{
    var corLinha = '';

    switch (status) {
        case 0:
            corLinha = 'SinalVerde';            
            break;
        case 1:
            corLinha = 'SinalAmarelo';            
            break;
        case 2:
            corLinha = 'SinalVermelho';
            break;
        default:
            corLinha = 'SinalDesconhecido';            
            break;
    }

    return corLinha;
}

function ExibirDetalhesStatus(e)
{    
    var nomeGrid = '#' + e.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.id;
    var dataItem = $(nomeGrid).data("kendoGrid").dataItem(e.parentElement.parentElement.parentElement);
    
    dsStatus = [];

    //Preparar DataSet para Grid Status
    if (dataItem.monitoramentoStatus.lstItensVermelho != null) {
        for (var i = 0; i < dataItem.monitoramentoStatus.lstItensVermelho.length; i++) {
            dsStatus.push({
                "Id": dataItem.monitoramentoStatus.lstItensVermelho[i].Id,
                "Status": 2,
                "Descricao": dataItem.monitoramentoStatus.lstItensVermelho[i].Descricao,
                "DataHora": dataItem.monitoramentoStatus.lstItensVermelho[i].dataHora
            });
        }
    }

    if (dataItem.monitoramentoStatus.lstItensAmarelo != null) {
        for (var i = 0; i < dataItem.monitoramentoStatus.lstItensAmarelo.length; i++) {
            dsStatus.push({
                "Id": dataItem.monitoramentoStatus.lstItensAmarelo[i].Id,
                "Status": 1,
                "Descricao": dataItem.monitoramentoStatus.lstItensAmarelo[i].Descricao,
                "DataHora": dataItem.monitoramentoStatus.lstItensAmarelo[i].dataHora
            });
        }
    }
    
    if (dataItem.monitoramentoStatus.lstItensVerde != null) {
        for (var i = 0; i < dataItem.monitoramentoStatus.lstItensVerde.length; i++) {
            dsStatus.push({
                "Id": dataItem.monitoramentoStatus.lstItensVerde[i].Id,
                "Status": 0,
                "Descricao": dataItem.monitoramentoStatus.lstItensVerde[i].Descricao,
                "DataHora": dataItem.monitoramentoStatus.lstItensVerde[i].dataHora
            });
        }
    }

    ExibirGridStatus(nomeGrid);   
}

function ExibirGridStatus(nomeGridOrigem) {
    $('#gridStatus').html("");

    if (nomeGridOrigem == "#gridInfraestrutura") {
        $("#gridStatus").kendoGrid({
            dataSource: {
                data: dsStatus,
                pageSize: 10,
                sort: { field: "Descricao", dir: "asc" }
            },
            dataBound: function (e) {
                if (this._data.length > 0) {
                    var items = this._data;
                    var tableRows = $(this.table).find("tr");
                    tableRows.each(function (index) {
                        var row = $(this);
                        var item = items[index];
                        row.addClass(RetornarCorLinha(item.Status));
                    });
                }
            },
            scrollable: true,
            groupable: false,
            resizable: false,
            sortable: false,
            pageable: {
                pageSizes: [10, 25, 50]
            },
            columns: [
                { field: "Id", hidden: true },
                {
                    field: "Descricao",
                    headerTemplate: "<strong>Descrição</strong>",
                    width: "75%"
                },
                {
                    field: "DataHora",
                    headerTemplate: "<strong>Data / Hora</strong>",
                    template: "#=FormatDateKendo(DataHora) #",
                    width: "15%"
                },
                {
                    title: " ",
                    headerTemplate: "<strong>Resolver</strong>",
                    template: kendo.template($("#botaoResolverProblemaInfraTemplate").html()),
                    width: "48px",
                    filterable: false
                }
            ]
        });
    }
    else {
        $("#gridStatus").kendoGrid({
            dataSource: {
                data: dsStatus,
                pageSize: 10,
                sort: { field: "DataHora", dir: "asc" }
            },
            dataBound: function (e) {
                if (this._data.length > 0) {
                    var items = this._data;
                    var tableRows = $(this.table).find("tr");
                    tableRows.each(function (index) {
                        var row = $(this);
                        var item = items[index];
                        row.addClass(RetornarCorLinha(item.Status));
                    });
                }
            },
            scrollable: true,
            groupable: false,
            resizable: false,
            sortable: false,
            pageable: {
                pageSizes: [10, 25, 50]
            },
            columns: [              
                {
                    field: "Descricao",
                    headerTemplate: "<strong>Descrição</strong>",
                    width: "75%"
                },
                {
                    field: "DataHora",
                    headerTemplate: "<strong>Data / Hora</strong>",
                    template: "#=FormatDateKendo(DataHora) #",
                    width: "15%"
                }               
            ]
        });
    }

    $('#modalStatus').modal({ backdrop: 'static', keyboard: false });
}

function CarregarGridInfraestrutura()
{   
    $('#gridInfraestrutura').html("");
    $('#gridInfraestrutura').kendoGrid({
        dataSource: {
            schema: {
                data: function (result) {
                    return result.Data;
                },
                total: function (result) {
                    return result.Total;
                }
            },
            transport: {
                read: {
                    url: "/Home/StatusInfraestrutura",
                    dataType: "json",
                    type: "GET",
                    async: true,
                    cache: false
                }
            },
            pageSize: 5
        },
        dataBound: function (e) {           
            if (this._data.length > 0) {
                var items = this._data;
                var tableRows = $(this.table).find("tr");
                tableRows.each(function (index) {
                    var row = $(this);
                    
                    if(row[0].innerHTML.substring(1, 3) != "th") {
                        var item = items[index - 1];
                        row.addClass(RetornarCorLinha(item.Status));
                    }   
                });
            }
        },
        filterable: false,
        groupable: false,
        scrollable: false,
        pageable: {
            pageSizes: [5, 10, 25, 50]
        },
        columns: [
            { field: "monitoramentoStatus", hidden: true },           
            {
                headerTemplate: "<strong>Status</strong>",
                template: "<center><a onclick='javascript:{ExibirDetalhesStatus(this);}' class='k-button'>" +
                    "<span title='Visualizar' class='glyphicon glyphicon-search'></span></a></center>",
                width: "10%"
            },
            {
                 field: "Servico",
                 headerTemplate: "<strong>Servico</strong>",            
                 width: "45%"
            },
            {
                field: "Cliente",
                headerTemplate: "<strong>Cliente</strong>",
                width: "45%"
            }
        ]
    });   
}

function RefreshGrids() {
    setInterval(function () {        
        $('#gridIntegracoes').data('kendoGrid').dataSource.read();
        $('#gridInfraestrutura').data('kendoGrid').dataSource.read();
    },60000);
}

function ResolverProblemaInfra(e) {
    var dataItem = $("#gridStatus").data("kendoGrid").dataItem(e.parentElement.parentElement.parentElement);
    
    $.ajax({
        url: "/Home/AtualizarStatusProblemaInfra?idRetorno=" + dataItem.Id,
        type: "GET",
        dataType: "json",
        async: false,
        success: function (result) {
            if (result.Sucesso == true) {
                for (var i = 0; i < dsStatus.length; i++) {
                    if (dsStatus[i].Id == dataItem.Id) {
                        dsStatus.splice(i, 1);
                        i = 0;
                        break;
                    }
                }

                CarregarGridInfraestrutura();

                if (dsStatus.length > 0)
                    ExibirGridStatus('#gridInfraestrutura');
                else
                {
                    $('#modalStatus').modal("hide");
                    //$('#' + e.parentElement.parentElement.parentElement.parentElement.id).modal("hide");
                }
            }
            else
                ShowModalAlerta(result.msgErro);
        }
    });    
}