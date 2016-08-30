var msgFiltroSemRegistro = "";
var expandedRowUid;

function CarregaComponentes() {
    $('#labelCNPJ').show();
    $('#selectCNPJ').show();

    msgFiltroSemRegistro = "Nenhuma nota fiscal foi encontrada. Verifique:<br/>"
                         + "- se a Data de Emissão é posterior aos dados disponíveis na base de dados;<br/>"
                         + "- se a unidade que atende consta na lista disponível na Política de Devoluções;<br/>"
                         + "- se o CNPJ emitente é o que Cliente está alocado atualmente;";

    LoadDsGrid();
    
    $('#ckConcordo').click(function () {
        if ($('#ckConcordo').is(':checked')) {
            $('#btnDevolver').show();
        }
        else {
            $('#btnDevolver').hide();
        }
    });

    $('#btnPesquisarNotas').click(function () {
        BuscarDadosGrid(msgFiltroSemRegistro);
    });

    $('#btnLimparPequisa').click(function () {
        document.getElementById("txtNotaInicio").value = "";
        document.getElementById("txtNotaFim").value = "";
        document.getElementById("txtDataInicio").value = "";
        document.getElementById("txtDataFim").value = "";
        BuscarDadosGrid(msgFiltroSemRegistro);
    });

    $('#txtNotaInicio').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            BuscarDadosGrid(msgFiltroSemRegistro);
        }
    });

    $('#txtNotaFim').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            BuscarDadosGrid(msgFiltroSemRegistro);
        }
    });

    $('#txtDataInicio').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            BuscarDadosGrid(msgFiltroSemRegistro);
        }
    });

    $('#txtDataFim').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            BuscarDadosGrid(msgFiltroSemRegistro);
        }
    });
}

function AutoComplete() {
    var kgrid = $("#grid").data("kendoGrid");

    if (kgrid == undefined) {
        return;
    }

    var dsOld = kgrid.dataSource.data();
    var dsNotas = [];

    // Notas
    for (var i in dsOld) {
        if (dsNotas.indexOf(dsOld[i].numeroNotaFiscal) == -1 && dsOld[i].numeroNotaFiscal != undefined) {
            dsNotas.push("" + dsOld[i].numeroNotaFiscal + "");
        }
    }

    $("#txtNotaInicio").kendoAutoComplete({
        dataSource: dsNotas,
        filter: "startswith",
        placeholder: "Nº da nota fiscal"
    });
    $("#txtNotaFim").kendoAutoComplete({
        dataSource: dsNotas,
        filter: "startswith",
        placeholder: "Nº da nota fiscal"
    });
}

function LoadDsGrid(cnpj) {
    var datasource = undefined;
    cnpj = LerCookie("SelectCNPJ");
    if (cnpj == undefined) {
        CarregarCombo();
    }

    $.ajax({
        url: "/DevolucaoNotas/Pesquisar?cnpj=" + cnpj,
        type: "GET",        
        dataType: "json",
        async: false,
        cache: false,
        success: function (result) {
            if (result.length > 0) {
                datasource = result;
                GridNotas(datasource);
            }
            else {
                $("#grid").removeAttr("class");
                $("#grid").html("<p>Nenhuma nota encontrada!</p>");
            }
        }
    });

    AutoComplete();
}

function GridNotas(ds) {
    $("#grid").html("");
    $("#grid").kendoGrid({
        dataSource: {
            data: ds,
            schema: {
                model: {
                    fields: {
                        numeroNotaFiscal: { type: "string" },
                        DataEmissao: { type: "date" }
                    }
                }
            },
            pageSize: QtdItens(),
            sort: {
                field: "DataEmissao",
                dir: "desc"
            }
        },
        //autoSync: true,
        groupable: true,
        resizable: true,
        sortable: true,
        pageable: {
            pageSizes: [10, 25, 50]
        },
        sortable: true,
        detailExpand: function(e) {
            expandedRowUid = e.masterRow.data('uid');
        },
        detailInit: detailInit,
        dataBinding: function (e) {
            var habilitarChk = false;
            var newDevolucao = [];
            var dataItem = $("#grid").data("kendoGrid");
            dataItem = dataItem._data;

            loopPrincipal:
            for (var i in dataItem) {
                for (var j in dataItem[i].lstProdutos) {
                    if (dataItem[i].lstProdutos[j].quantidadeDevolver != null) {
                        if (dataItem[i].lstProdutos[j].quantidadeDevolver > 0) {
                            dataItem[i].lstProdutos[j].quantidadeDevolver = parseInt(dataItem[i].lstProdutos[j].quantidadeDevolver);
                            habilitarChk = true;
                            break loopPrincipal;
                        }
                    }
                }
            }

            if (habilitarChk) {
                $('#linkPolitica').show();
                $('#labelConcordo').show();                
            }
            else {               
                $('#linkPolitica').hide();
                $('#labelConcordo').hide();
                $('#ckConcordo')[0].checked = false;
                $('#btnDevolver').hide();
            }
        },
        dataBound: function () {
            if (expandedRowUid != undefined) {
                this.expandRow($('tr[data-uid=' + expandedRowUid + ']'));
            }
        },
        columns: [
            {
                field: "numeroNotaFiscal",
                title: "Número da Nota Fiscal",
                width: "80%"
            },
            {
                field: "DataEmissao",
                title: "Data de Emissão da Nota Fiscal",
                template: "#= kendo.toString(kendo.parseDate(DataEmissao, 'yyyy-MM-dd'), 'dd/MM/yyyy') #",
                width: "20%"
            }
        ]
    });
}

function detailInit(e) {
    var tempID = e.data.idNotaFiscal;
    $('<div/>').appendTo(e.detailCell).kendoGrid({
        dataSource: {
            data: e.data.lstProdutos,
            pageSize: 5,
            filter: { field: "idNotaFiscal", operator: "eq", value: e.data.idNotaFiscal },
            //batch: true,
            schema: {
                model: {
                    fields: {
                        Descricao: { editable: false },
                        cEAN: { editable: false },
                        quantidadeDisponivel: { editable: false },
                        quantidadeDevolver: {
                            type: "number", format: "0", decimals: 0, validation: { step: 1, min: 0}
                        }
                    }
                }
            }
        },        
        save: function (e) {
            var qtdDis = e.model.quantidadeDisponivel;
            var inputNum = $(e.sender._editContainer[0]).children().children().children()[1];

            if ($(inputNum).val() > qtdDis) {
                e.preventDefault();
                var msg = "A Quantidade Devolvida deve ser menor ou igual a " + qtdDis + "! Alteração cancelada.";
                ShowModalAlerta(msg);
                return;
            }
        },      
        scrollable: false,
        sortable: true,
        pageable: true,
        editable: true,
        resizable: true,
        columns: [
            { field: "Descricao", title: "Produto", width: "50%" },
            { field: "cEAN", title: "Código de Barras", width: "20%" },
            { field: "quantidadeDisponivel", title: "Quantidade Disponível", width: "15%" },
            {
                field: "quantidadeDevolver",
                template: "# if(quantidadeDevolver !== null){# #=parseInt(quantidadeDevolver)# #} else{# 0 #} #",
                editor: tbQtdDisponivel,                
                title: "Quantidade a Devolver",
                width: "15%",                
                attributes: {style: "background-color: lightyellow;" }
            }
        ]
    });
}

function tbQtdDisponivel(container, options) {
    $('<input data-text-field="Name" data-value-field="Descricao" data-bind="value:' + options.field + '"/>')
        .appendTo(container)
        .kendoNumericTextBox({
            format: "0",
            decimals: 0,
            min: 0,
            //max: options.model.quantidadeDisponivel,
            step: 1
        });
}

function QtdItens() {
    var qtdItens = undefined;
    $.ajax({
        url: "/Config/ObterParametrizacoes",
        type: "GET",
        async: false,
        cache: false,
        dataType: "json",
        success: function (result) {
            try {
                qtdItens = result.quantidadeNotaFiscalPagina;
            }
            catch (e) {
                qtdItens = 10;
            }
        }
    });
    return qtdItens;
}

function DevolucaoNota() {
    $("#loading-page").show();

    var newDevolucao = [];
    var dataItem = $("#grid").data("kendoGrid");
    dataItem = dataItem._data;

    // Cria um novo array de devolução, com ID das Notas, ID dos Produtos e Quantidades a Devolver
    for (var i in dataItem) {
        loopItensNota:
        for (var j in dataItem[i].lstProdutos) {
            if (dataItem[i].lstProdutos[j].quantidadeDevolver != null) {
                if (dataItem[i].lstProdutos[j].quantidadeDevolver <= dataItem[i].lstProdutos[j].quantidadeDisponivel) {
                    if (dataItem[i].lstProdutos[j].quantidadeDevolver > 0) {
                        newDevolucao.push({
                            idNotaFiscal: dataItem[i].lstProdutos[j].idNotaFiscal,
                            lstProdutos: getProdDev(dataItem[i])
                        });
                        break loopItensNota;
                    }
                }
            }
        }
    }

    if (newDevolucao.length != 0) {
        var cnpj = LerCookie("SelectCNPJ");
        if (cnpj == undefined) {
            cnpj = $("#selectCNPJ").data("kendoDropDownList")._selectedValue;
        }

        var title = "RESUMO DO PEDIDO DE DEVOLUÇÃO";
        ResumoDevolucoes("/DevolucaoNotas/DevolverNotas?cnpj=" + cnpj, newDevolucao, title);
        $("#grid").html("");
        $('#ckConcordo')[0].checked = false;
        LoadDsGrid();
    }
    else {
        $("#loading-page").hide();
        var msg = "Não é possível efetuar a devolução desta nota, pois possui quantidades inválidas de devoluções, verifique e tente novamente!";
        ShowModalAlerta(msg);
    }
}

function getProdDev(data) {
    var prods = [];
    for (var k = 0; k < data.lstProdutos.length; k++) {
        if (data.lstProdutos[k].quantidadeDevolver != null) {
            if (data.lstProdutos[k].quantidadeDevolver <= data.lstProdutos[k].quantidadeDisponivel) {
                if (data.lstProdutos[k].quantidadeDevolver != 0) {
                    prods.push({
                        idProduto: data.lstProdutos[k].idProduto,
                        quantidadeDevolver: parseInt(data.lstProdutos[k].quantidadeDevolver)
                    });
                }
            }
        }
    }

    return prods;
}