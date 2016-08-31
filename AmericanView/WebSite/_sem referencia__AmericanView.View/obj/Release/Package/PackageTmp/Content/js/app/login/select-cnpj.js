function CarregarComboCNPJ()
{
    var cnpjInit = LerCookie("SelectCNPJ");
    if (cnpjInit == undefined)
    {
        $('#modalSelectCnpj').modal({ backdrop: 'static', keyboard: false });
        $('#modalSelectCnpj .modal-dialog .modal-body').html(CarregarGridCNPJ());
        AutoCompleteCNPJ();

        $('#btnPesquisar').click(function () {
            BuscarEmpresas();
        });

        $('#btnLimpar').click(function () {
            document.getElementById("txtCNPJ").value = "";
            document.getElementById("txtRazaoSocial").value = "";
            BuscarDadosGrid();
        });
    }
    else
    {
        CarregarCombo();
        $("#selectCNPJ").kendoDropDownList({
            value: cnpjInit
        });

        var dropdownlist = $("#selectCNPJ").data("kendoDropDownList");
        dropdownlist.bind("change", onChangeDropDownCNPJ);
    }

    $('#txtCNPJ').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            BuscarDadosGrid();
        }
    });

    $('#txtRazaoSocial').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            BuscarDadosGrid();
        }
    });
}

function CarregarCombo() {
    var dataCNPJ = undefined;
    $.ajax({
        url: "/Home/GetCNPJsCombo",
        type: "GET",
        async: true,
        dataType: "json",
        async: false,
        success: function (result) {
            dataCNPJ = result;
        }
    });

    $("#selectCNPJ").kendoDropDownList({
        placeholder: "Escolha ...",
        change: onChangeDropDownCNPJ,
        dataSource: dataCNPJ
    });
}

function onChangeDropDownCNPJ(e) {
    var dataItem = this.dataItem(e.item);
    if (dataItem.text == undefined) {
        GerarCookie("SelectCNPJ", dataItem, 30);
    }
    else {
        GerarCookie("SelectCNPJ", dataItem.value, 30);
    }
    try {
        $("#gridCNPJ").html("");
        LoadDsGrid(dataItem.value);
    }
    catch (e) {

    }
}

function CarregarGridCNPJ() {
    var datasource = undefined;

    $.ajax({
        url: "/Home/GetCNPJsGrid",
        type: "GET",
        async: false,
        cache: false,
        dataType: "json",
        success: function (result) {
            if (result.length > 0) {
                datasource = result;
                GridCNPJ(datasource);
                var grid = $("#gridCNPJ").data("kendoGrid");
                var row = grid.select("tr:eq(1)");
                SelecionarCNPJ(datasource[0]);
            }
            else {
                $("#gridCNPJ").removeAttr("class");
                $("#gridCNPJ").html("<p>Nenhuma Filial encontrada!</p>");
            }
        }
    });  
}

function GridCNPJ(ds)
{
    $("#gridCNPJ").kendoGrid({
        dataSource: {            
            data: ds,           
            pageSize: 5                   
        },    
        scrollable: true,
        selectable: true,
        sortable: true,
        groupable: false,
        resizable: true,
        cache: false,        
        columns: [
            { field: "CNPJCPF", title: "CNPJ", width: "15%" },
            { field: "razaoSocial", title: "Razão Social", width: "25%" },
            { field: "Logradouro", title: "Endereço", width: "25%" },            
            { field: "Bairro", title: "Bairro", width: "10%" },
            { field: "CEP", title: "CEP", width: "10%" },
            { field: "Cidade", title: "Cidade", width: "10%" },
            { field: "UF", title: "UF", width: "5%" }
        ]
    });
}

function AutoCompleteCNPJ() {
    var kgrid = $("#gridCNPJ").data("kendoGrid");

    if (kgrid == undefined)
        return;

    var dsOld = kgrid.dataSource.data();
    var dsCNPJ = [];
    var dsRazaoSocial = [];

    // CNPJ's
    for (var i in dsOld) {
        if (dsCNPJ.indexOf(dsOld[i].CNPJCPF) == -1) {
            dsCNPJ.push("" + dsOld[i].CNPJCPF + "");
        }
        if (dsRazaoSocial.indexOf(dsOld[i].razaoSocial) == -1) {
            dsRazaoSocial.push("" + dsOld[i].razaoSocial + "");
        }
    }

    $("#txtCNPJ").kendoAutoComplete({
        dataSource: dsCNPJ,
        filter: "startswith",
        placeholder: "CNPJ"
    });
    $("#txtRazaoSocial").kendoAutoComplete({
        dataSource: dsRazaoSocial,
        filter: "startswith",
        placeholder: "Razão Social"
    });
}

function BuscarEmpresas() {
    $filter = new Array();
    var orfilter = "";
    var grid = $("#gridCNPJ").data("kendoGrid");

    $(".filter").each(function (index, ele) {
        switch ($(this).val()) {
            case "":
            case "Escolha ...":
                break;
            default:
                var value = $(ele).val();
                var label = $(ele).data("field");
                $filter.push({ field: label, operator: "contains", value: value });
                break;
        }
    });

    if ($filter.length >= 2) {
        orfilter = { logic: "and", filters: $filter };
    }
    else {
        orfilter = { filters: $filter };
    }

    grid.dataSource.filter(orfilter);
}

function SelecionarCNPJ(linhaGrid, modal)
{  
    var cnpjInit = linhaGrid.CNPJCPF + ' Razão Social: ' + linhaGrid.razaoSocial;
    GerarCookie("SelectCNPJ", cnpjInit, 30);
}