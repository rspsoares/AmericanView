function CarregaComponentes() {
    $('#labelCNPJ').show();
    $('#selectCNPJ').show();

    LoadDsGrid();
    AutoComplete();

    $('#ckConcordo').click(function () {
        if ($('#ckConcordo').is(':checked')) {
            $('#btnDevolver').show();
        }
        else {
            $('#btnDevolver').hide();
        }
    });

    $('#btnPesquisarProdutos').click(function () {
        BuscarDadosGrid();
    });

    $('#btnLimparPequisa').click(function () {
        document.getElementById("txtNomeProduto").value = "";
        document.getElementById("txtCodBarras").value = "";        
        BuscarDadosGrid();
    });

    $('#txtNomeProduto').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            BuscarDadosGrid();
        }
    });

    $('#txtCodBarras').keypress(function (event) {
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
    var dsNomeProd = [];
    var dsCodBarras = [];

    // New DS
    for (var i in dsOld) {
        if (dsNomeProd.indexOf(dsOld[i].Descricao) == -1 && dsOld[i].Descricao != undefined) {
            dsNomeProd.push(dsOld[i].Descricao);
        }
        if (dsCodBarras.indexOf(dsOld[i].cEAN) == -1 && dsOld[i].cEAN != undefined) {
            dsCodBarras.push("" + dsOld[i].cEAN + "");
        }
    }

    $("#txtNomeProduto").kendoAutoComplete({
        dataSource: dsNomeProd,
        filter: "startswith",
        placeholder: "Produto"
    });
    $("#txtCodBarras").kendoAutoComplete({
        dataSource: dsCodBarras,
        filter: "startswith",
        placeholder: "Nº do Código de Barras"
    });
}

function LoadDsGrid(cnpj) {
    var datasource = undefined;
    cnpj = LerCookie("SelectCNPJ");
    if (cnpj == undefined) {
        CarregarCombo();
    }

    $.ajax({
        url: "/DevolucaoProdutos/Pesquisar?cnpj=" + cnpj,
        type: "GET",
       
        dataType: "json",
        async: false,
        cache: false,
        success: function (result) {
            if (result.length > 0) {
                datasource = result;
                GridProdutos(datasource);
            }
            else {
                $("#grid").removeAttr("class");
                $("#grid").html("<p>Nenhum produto encontrado!</p>");
            }
        }
    });
}

function GridProdutos(ds) {
    $("#grid").html("");
    $("#grid").kendoGrid({
        dataSource: {            
            data: ds,
            schema: {
                model: {
                    fields: {
                        Descricao: { editable: false },
                        cEAN: { type: "string", editable: false },
                        qtdDisponivel: { editable: false },
                        qtdDevolver: { type: "number", format: "#", validation: { step: 1, min: 0 }  }
                    }
                }
            },
            pageSize: QtdItens(),
            sort: {
                field: "Descricao",
                dir: "asc"
            }           
        },        
        autoSync: true,
        scrollable: true,
        groupable: true,
        resizable: true,
        sortable: true,
        editable: true,
        cache: false,
        pageable: {
            pageSizes: [10, 25, 50]
        },                
        save: function (e) {
            var qtdDis = e.model.qtdDisponivel;
            var inputNum = $(e.sender._editContainer[0]).children().children().children()[1];
        
            if ($(inputNum).val() > qtdDis) {
                e.preventDefault();
                var msg = "A Quantidade Devolvida deve ser menor ou igual a " + qtdDis + "! Alteração cancelada.";
                ShowModalAlerta(msg);           
                return;
            }          
            if ($(inputNum).val() > 0) {                       
                $('#linkPolitica').show();
                $('#labelConcordo').show();
            }
            else {
                var newDevolucao = [];
                var dataItem = this._data;

                for (var i in dataItem) {
                    if (dataItem[i].qtdDevolver != null) {                       
                        if (dataItem[i].qtdDevolver <= dataItem[i].qtdDisponivel) {
                            if (e.model.idProduto != dataItem[i].idProduto && dataItem[i].qtdDevolver != 0) {                               
                                return;
                            }
                        }
                    }
                }

                $('#ckConcordo')[0].checked = false;                
                $('#linkPolitica').hide();
                $('#labelConcordo').hide();
                $('#btnDevolver').hide();               
            }        
        },
        dataBinding: function (e) {
            $('#linkPolitica').hide();
            $('#labelConcordo').hide();
            $('#btnDevolver').hide();
        },
        columns: [
            { field: "idProduto", hidden: true },
            { field: "Descricao", title: "Descrição do Produto", width: "50%" },
            { field: "cEAN", title: "Código de Barras do Produto", width: "20%" },
            { field: "qtdDisponivel", title: "Quantidade Disponível", width: "15%" },
            {
                field: "qtdDevolver",
                template: "#if(qtdDevolver !== null){# #=parseInt(qtdDevolver)# #} else{# 0 #} #",
                editor: tbQtdDisponivel,
                title: "Quantidade a Devolver",
                width: "15%",
                attributes: { style: "background-color: lightyellow" }
            }
        ]
    });
}

function tbQtdDisponivel(container, options) {
    $('<input data-text-field="qtdDevolver" data-value-field="qtdDevolver" data-bind="value:' + options.field + '"/>')
        .appendTo(container)
        .kendoNumericTextBox({
            format: "0",
            decimals: 0,
            min: 0,
            //max: options.model.qtdDisponivel,
            step: 1
        });
}

function QtdItens() {
    var qtdItens = undefined;
    $.ajax({
        url: "/Config/ObterParametrizacoes",
        type: "GET",
        cache: false,
        async: false,
        dataType: "json",
        success: function (result) {
            try {
                qtdItens = result.quantidadeProdutoPagina;
            }
            catch (e) {
                qtdItens = 10;
            }
        }
    });
    return qtdItens;
}

function DevolverProdutos() {
    $("#loading-page").show();

    var newDevolucao = [];
    var dataItem = $("#grid").data("kendoGrid");
    dataItem = dataItem._data;

    for (var i in dataItem) {
        if (dataItem[i].qtdDevolver != null) {
            if (dataItem[i].qtdDevolver <= dataItem[i].qtdDisponivel) {
                if (dataItem[i].qtdDevolver != 0) {
                    newDevolucao.push({
                        idProduto: dataItem[i].idProduto,
                        qtdDevolver: dataItem[i].qtdDevolver
                    });
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
        ResumoDevolucoes("/DevolucaoProdutos/DevolverProdutos?cnpj=" + cnpj, newDevolucao, title);
        $('#ckConcordo')[0].checked = false;
        $("#grid").html("");        
        LoadDsGrid();        
    }
    else {
        var msg = "Não é possível efetuar a devolução desta nota, pois possui quantidades inválidas de devoluções, verifique e tente novamente!";
        ShowModalAlerta(msg);
        $("#loading-page").hide();
    }
}