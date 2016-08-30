function CarregarComponentes() {
    CarregarGridImportacao();
    CarregarGridHistorico();
    CarregarGridSaldos();
    CarregarGridPeriodoAberto();

    $('#btnImportar').click(function () {
        VerificarArquivosImportacoes();
    });
}

function CarregarGridSaldos() {
    var dsSaldos = [];
    var objSaldos = [];
    var lstCred = [];
    var lstUtil = [];

    $.ajax({
        url: "/Home/PesquisarSaldos",
        type: "GET",
        async: false,
        dataType: "json",
        cache: false,
        success: function (result) {
            if (result.Sucesso)
                dsSaldos = result.Data;
            else
                ShowModalAlerta(result.Msg);
        }
    });

    $("#lbSaldoCalculadoPeriodo").text(dsSaldos.saldoPeriodo.FormatarMoeda(2, '', '.', ','));
    $("#lbSaldoAnual").text(dsSaldos.saldoAnual.FormatarMoeda(2, '', '.', ','));
    $("#lbSaldoUtilizado").text(dsSaldos.saldoUtilizado.FormatarMoeda(2, '', '.', ','));

    for (var i in dsSaldos.lstCreditos) {
        lstCred.push([
            dsSaldos.lstCreditos[i].Ano,
            dsSaldos.lstCreditos[i].Mes,
            dsSaldos.lstCreditos[i].Valor
        ]);

        lstUtil.push([
            dsSaldos.lstUtilizados[i].Ano,
            dsSaldos.lstUtilizados[i].Mes,
            dsSaldos.lstUtilizados[i].Valor
        ]);
    }

    objSaldos = {
        "Crédito": lstCred,
        "Utilizado": lstUtil
    };

    seriesData = [];

    for (var prop in objSaldos) {
        seriesData.push({
            label: prop, data: $.map(objSaldos[prop], function (i, j) {
                return [[new Date(i[0], i[1] - 1).getTime(), i[2]]];
            })
        });
    }

    $.plot("#flot-dashboard-chart", seriesData, {
        series: {
            lines: {
                show: false,
                fill: true
            },
            splines: {
                show: true,
                tension: 0.4,
                lineWidth: 1,
                fill: 0.4
            },
            points: {
                radius: 0,
                show: true
            },
            shadowSize: 2
        },
        grid: {
            hoverable: true,
            clickable: true,
            tickColor: "#d5d5d5",
            borderWidth: 1,
            color: '#d5d5d5'
        },
        xaxis: { mode: "time", timeformat: "%b/%Y" }
    });
}

function CarregarGridImportacao() {
    $('#gridImportacao').html("");
    $('#gridImportacao').kendoGrid({
        dataSource: {
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
                        razaoSocial: { type: "text", validation: { required: false } },
                        modeloArquivo: { type: "text", validation: { required: false } },
                        descricaoStatus: { type: "text", validation: { required: false } },
                        dataImportacao: { type: "date", validation: { required: false } }
                    }
                }
            },
            transport: {
                read: {
                    url: "/Home/PesquisarImportacoes",
                    dataType: "json",
                    type: "GET",
                    async: true,
                    cache: false
                }
            },
            pageSize: 5
        },
        filterable: true,
        groupable: true,
        scrollable: false,
        pageable: {
            pageSizes: [5, 10, 25, 50]
        },
        columns: [
            { field: "Id", hidden: true },
            { field: "Ocorrencia", hidden: true },
            { field: "razaoSocial", headerTemplate: "<strong>Empresa</strong>", width: "210px" },
            { field: "modeloArquivo", headerTemplate: "<strong>Modelo</strong>", width: "130px" },
            { field: "descricaoStatus", headerTemplate: "<strong>Status</strong>", width: "150px", template: "<a onclick='javascript:{ExibirOcorrenciaImportacao(this);}' style='cursor: pointer;'>#=descricaoStatus#</a>" },
            { field: "dataImportacao", headerTemplate: "<strong>Momento</strong>", template: "#= kendo.toString(kendo.parseDate(dataImportacao, 'yyyy-MM-dd HH:mm:ss'), 'dd/MM/yyyy HH:mm:ss') #" }
        ]
    });
}

/*GRID - Painel de Histórico/Ocorrências de Sistema*/
function CarregarGridHistorico() {   
    $('#gridHistorico').html("");
    $('#gridHistorico').kendoGrid({
        dataSource: {
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
                        Evento: { type: "text", validation: { required: true } },
                        Descricao: { type: "text", validation: { required: false } },
                        DhOcorrencia: { type: "date", validation: { required: true } }
                    }
                }
            },
            transport: {
                read: {
                    url: "/Home/RecuperarHistorico",
                    dataType: "json",
                    type: "GET",
                    async: true,
                    cache: false
                }
            },
            pageSize: 5
        },
        filterable: true,
        groupable: true,
        scrollable: false,
        pageable: {
            pageSizes: [5,10, 25, 50]
        },        
        columns: [
            { field: "Id", hidden: true },
            { field: "Evento", title: "Evento", width: "10%" },
            { field: "Descricao", title: "Descrição", width: "60%" },
            { field: "DhOcorrencia", title: "Ocorrência", template: "#= kendo.toString(kendo.parseDate(DhOcorrencia, 'yyyy-MM-dd HH:mm:ss'), 'dd/MM/yyyy HH:mm:ss') #", width: "30%" }
        ]
    });   

    RefreshHistorico();
}

/*TIMER - Mantém o Histórico Atualizado*/
function RefreshHistorico() {
    setInterval(function () {
        var now = new Date();
        var dataAgora = kendo.toString(kendo.parseDate(now, 'HH:mm:ss'), 'HH:mm:ss');
        $('#dhHistorico').text('Última atualização realizada às ' + dataAgora);
        $('#gridHistorico').data('kendoGrid').dataSource.read();
    },30000);
}

function ExibirOcorrenciaImportacao(e) {
    var dataHtml = '';
    var dataItem = $("#gridImportacao").data("kendoGrid").dataItem(e.parentElement.parentElement);

    dataHtml = 'Ocorrências:<br><strong>' + dataItem.Ocorrencia + '</strong>';

    $('#modalOcorrenciaImportacao').modal({ backdrop: 'static', keyboard: false });
    $('#modalOcorrenciaImportacao .modal-dialog .modal-body').html(dataHtml);
}

function VerificarArquivosImportacoes() {
    $.ajax({
        url: "/Home/VerificarArquivoImportacoes",
        type: "GET",
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

function CarregarGridPeriodoAberto()
{
    $('#gridPeriodo').html("");
    $('#gridPeriodo').kendoGrid({
        dataSource: {
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
                        nomeEmpresa: { type: "text", validation: { required: false } },
                        AnoMes: { type: "text", validation: { required: false } }
                    }
                }
            },
            transport: {
                read: {
                    url: "/Home/RecuperarPeriodosAbertos",
                    dataType: "json",
                    type: "GET",
                    async: true,
                    cache: false
                }
            },
            pageSize: 5
        },
        filterable: true,
        groupable: true,
        scrollable: false,
        pageable: {
            pageSizes: [5, 10, 25, 50]
        },
        columns: [
            { field: "Id", hidden: true },
            { field: "nomeEmpresa", headerTemplate: "<strong>Empresa</strong>", width: "210px" },
            { field: "AnoMes", headerTemplate: "<strong>Período</strong>", width: "130px" }
        ]
    });   
}
