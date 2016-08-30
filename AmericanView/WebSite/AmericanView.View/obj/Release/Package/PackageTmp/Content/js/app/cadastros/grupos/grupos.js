var grupoOriginal = [];
function CarregaComponentes() {
    VerificarInscricaoUsuarioLogado();    

    $('#btnPesquisarGrupos').click(function () {
        BuscarDadosGrid();
    });

    $('#btnLimparPequisa').click(function () {
        document.getElementById("txtNome").value = "";
        document.getElementById("txtDesc").value = "";

        BuscarDadosGrid();
    });

    $('#txtNome').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            BuscarDadosGrid();
        }
    });

    $('#txtDesc').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            BuscarDadosGrid();
        }
    });  
}

function VerificarInscricaoUsuarioLogado() {
    $.ajax({
        url: "/Home/ObterInscricaoUsuarioLogado",
        type: "GET",
        async: false,
        dataType: "json",
        cache: true,
        success: function (result) {
            if (result == 0) {
                document.getElementById("lbInscricaoSelecionada").hidden = false;
                $('#btSelecionarInscricao').show();
                ExibirPopUpInscricoes();
            }
            else {
                LoadDsGrid(result);
            }
        }
    });
}

function ExibirPopUpInscricoes() {
    $('#modalInscricoes').modal({ backdrop: 'static', keyboard: false });
    LoadDsInscricoes();
}

function SelecionarInscricao(arg) {
    var selected = $.map(this.select(), function (item) {
        return $(item).text();
    });

    if (selected.length > 0)
        $('#btnSelectAccount').removeAttr('disabled');
    else
        $('#btnSelectAccount').attr('disabled', 'disabled');
}

function SelecionarLinhaGridInscricao() {
    var entityGrid = $("#gridGroupAccount").data("kendoGrid");
    var selectedItem = entityGrid.dataItem(entityGrid.select());

    $('#modalInscricoes').modal('hide');

    if (selectedItem != null) {
        $('#tbIdInscricao').val(selectedItem.Id);
        var inscricao = "Conta: " + selectedItem.Nome + " - Descrição: " + selectedItem.Descricao;
        $("#lbInscricaoSelecionada").text(inscricao);
        LoadDsGrid(selectedItem.Id);
    }
    else {
        ShowModalAlerta('Um grupo não foi selecionado');
        $("#lbInscricaoSelecionada").text("Favor selecionar uma Holding.");
        $('#tbIdInscricao').val("0");
    }
}

function LoadDsGrid(idInscricao) {
    var datasource = undefined;

    $.ajax({
        url: "/Grupos/Pesquisar?idInscricao=" + idInscricao,
        type: "GET",
        dataType: "json",
        async: false,
        cache: false,
        success: function (result) {
            if (result.length > 0) {
                datasource = result;
                GridGrupos(datasource);
            }
            else {
                $("#grid").removeAttr("class");
                $("#grid").html("<p>Nenhum Grupo encontrado!</p>");
            }
        }
    });

    AutoComplete();
}

function GridGrupos(ds) {
    $("#grid").html("");
    $("#grid").kendoGrid({
        dataSource: {
            data: ds,
            pageSize: 10,
            schema: {
                model: {
                    fields: {
                        Id: { type: "string" }
                    }
                }
            }
        },        
        scrollable: true,
        sortable: true,
        resizable: true,
        groupable: true,
        pageable: {
            pageSizes: [10, 25, 50]
        },
        columns: [
            { field: "Id", hidden: true },
            { field: "Nome", title: "Nome", width: "35%" },
            { field: "Descricao", title: "Descrição", width: "35%" },
            { 
                field: "dataCriacao", 
                title: "Data de Criação do Grupo", 
                template: "#= kendo.toString(kendo.parseDate(dataCriacao, 'yyyy-MM-dd'), 'dd/MM/yyyy') #",
                width: "20%" },
            {
                title: " ",
                template: "<a onclick='javascript:{EditGrupo(this, true);}' class='k-button'>"
                    + "<span title='Visualizar' class='glyphicon glyphicon glyphicon-search'></span></a>",
                width: "5%",
                filterable: false
            },
            {
                title: " ",
                template: "<a onclick='javascript:{EditGrupo(this, false);}' class='k-button'>"
                    + "<span title='Editar' class='glyphicon glyphicon glyphicon-pencil'></span></a>",
                width: "5%",
                filterable: false
            }
        ]
    });
}

function EditGrupo(e, locked) {
    var dataItem = $("#grid").data("kendoGrid").dataItem(e.parentElement.parentElement);
    var tituloJanela = '';
    var clientesSelecionados = []

    $("#loading-page").show();

    LimparCampos();
    
    $('#btnSalvar').removeAttr('onclick');
    $('#btnSalvar').attr('onclick', 'javascript:{SaveGroup("Edit");}');

    $('#idTxt').val(dataItem.Id);
    $('#nomeTxt').val(dataItem.Nome);
    $('#descTxt').val(dataItem.Descricao);    

    PesquisarClientes(dataItem.Id);

    $('#empresasSelectTxt option').each(function () {
        var key = $(this).val();
        clientesSelecionados.push(key);
    });

    grupoOriginal = {
        Nome: dataItem.Nome,
        Descricao: dataItem.Descricao,
        Clientes: clientesSelecionados
    };

    if (locked)
    {
        tituloJanela = 'Grupo de Empresas';
        $('#nomeTxt').attr('readonly', true);
        $('#descTxt').attr('readonly', true);
        $('#btnSalvar').hide();
        $('#btnCancelar').hide();
        $('#btnEditar').show();
        $('#btnVoltar').show();
        $('#btAdicionarCliente').hide();
        $('#btRemoverCliente').hide();        
    }
    else
    {
        tituloJanela = 'Editar Grupo de Empresas';
        $('#nomeTxt').attr('readonly', false);
        $('#descTxt').attr('readonly', false);
        $('#btnSalvar').show();
        $('#btnEditar').hide();
        $('#btnCancelar').show();
        $('#btnVoltar').hide();
        $('#btAdicionarCliente').show();
        $('#btRemoverCliente').show();
    }

    $('#modalEditGrupo').modal({ backdrop: 'static', keyboard: false });
    $('#modalEditGrupo .modal-dialog .modal-header center .modal-title strong').html("");
    $('#modalEditGrupo .modal-dialog .modal-header center .modal-title strong').html(tituloJanela);

    $("#loading-page").hide();
}

function LimparCampos(){
    $('#nomeTxt').val("");
    $('#descTxt').val("");
    $('#empresasTxt option').each(function () {
        $(this).remove();
    });
    $('#empresasSelectTxt option').each(function () {
        $(this).remove();
    });
}

function EditarVisualizacaoGrupo() {
    $('#modalEditGrupo .modal-dialog .modal-header center .modal-title strong').html("");
    $('#modalEditGrupo .modal-dialog .modal-header center .modal-title strong').html("Editar Grupo de Empresas");

    $('#btnSalvar').removeAttr('onclick');
    $('#btnSalvar').attr('onclick', 'javascript:{SaveGroup("Edit");}');

    $('#nomeTxt').attr('readonly', false);
    $('#descTxt').attr('readonly', false);

    $('#btnSalvar').show();
    $('#btnEditar').hide();
    $('#btnCancelar').show();
    $('#btnVoltar').hide();
    $('#btAdicionarCliente').show();
    $('#btRemoverCliente').show();
}

/*Cache search parameters*/
function AutoComplete() {
    var kgrid = $("#grid").data("kendoGrid");
    var dsOld = kgrid.dataSource.data();
    var dsNome = [];
    var dsDesc = [];

    // Grupos
    for (var i in dsOld) {
        if (dsNome.indexOf(dsOld[i].Nome) == -1 && dsOld[i].Descricao != undefined) {
            dsNome.push("" + dsOld[i].Nome + "");
        }
        if (dsDesc.indexOf(dsOld[i].Descricao) == -1 && dsOld[i].Descricao != undefined) {
            dsDesc.push("" + dsOld[i].Descricao + "");
        }
    }

    $("#txtNome").kendoAutoComplete({
        dataSource: dsNome,
        filter: "contains",
        placeholder: "Nome"
    });

    $("#txtDesc").kendoAutoComplete({
        dataSource: dsDesc,
        filter: "contains",
        placeholder: "Descrição"
    });    
}

/*(Open Modal) Add new group*/
function IncluirGrupo() {
    if ($('#tbIdInscricao').val() == "0")
    {
        ShowModalAlerta("Favor selecionar a Holding.");
        return;
    }

    $("#loading-page").show();

    $('#btnSalvar').removeAttr('onclick');
    $('#btnSalvar').attr('onclick', 'javascript:{SaveGroup("Add");}');

    $('#btnSalvar').show();
    $('#btnEditar').hide();
    $('#btnCancelar').show();
    $('#btnVoltar').hide();

    LimparCampos();

    grupoOriginal = {
        Nome: '',
        Descricao: '',
        Clientes: []
    };

    $('#modalEditGrupo').modal({ backdrop: 'static', keyboard: false });
    $('#modalEditGrupo .modal-dialog .modal-header center .modal-title strong').html("");
    $('#modalEditGrupo .modal-dialog .modal-header center .modal-title strong').html("Incluir Grupo de Empresas");

    PesquisarClientes();

    $("#loading-page").hide();
}

function VerificarCancelarEdicao() {
    var dataHTML = "";
    var clientesSelecionados = [];

    $('#empresasSelectTxt option').each(function () {
        var key = $(this).val();
        clientesSelecionados.push(key);
    });

    var grupoAtual = {
        Nome: $('#nomeTxt').val(),
        Descricao :$('#descTxt').val(),
        Clientes: clientesSelecionados
    };

    if (VerificarCampoAlterado(grupoAtual) == true) {
        dataHtml = '<div class="row">'
                   + '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">'
                       + 'As alterações serão perdidas. Deseja mesmo cancelar?'
                   + '</div>'
                 + '</div>';

        $('#modalCancelarEdicao').modal({ backdrop: 'static', keyboard: false });
        $('#modalCancelarEdicao .modal-dialog .modal-body').html("");
        $('#modalCancelarEdicao .modal-dialog .modal-body').html(dataHtml);
    }
    else {
        $('#modalCancelarEdicao').modal('hide');
        $('#modalEditGrupo').modal('hide');
    }
}

function VerificarCampoAlterado(grupoAtual) {
    if (grupoAtual.Nome != grupoOriginal.Nome) return true;
    if (grupoAtual.Descricao != grupoOriginal.Descricao) return true;    
    if (jQuery.compare(grupoAtual.Clientes, grupoOriginal.Clientes) == false) return true;   

    return false;
}

/*(Open Modal) Edit existing group*/
function ShowEditGroup(e) {
    var clientesSelecionados = [];
    $("#loading-page").show();
    var dataItem = $("#grid").data("kendoGrid").dataItem(e.parentElement.parentElement);

    $('#btnSalvar').removeAttr('onclick');
    $('#btnSalvar').attr('onclick', 'javascript:{SaveGroup("Edit");}');

    $('#btnAddEmpresa').show();
    $('#btnRemoveEmpresa').show();

    // Limpar Campos
    $('#idTxt').val("");
    $('#nomeTxt').val("");
    $('#descTxt').val("");
    $('#empresasTxt option').each(function () {
        $(this).remove();
    });
    $('#empresasSelectTxt option').each(function () {
        $(this).remove();
    });

    $('#idTxt').val(dataItem.Id);
    $('#nomeTxt').val(dataItem.Nome);
    $('#descTxt').val(dataItem.Descricao);
    $('#nomeTxt').attr('readonly', true);
    $('#descTxt').attr('readonly', true);

    PesquisarClientes(dataItem.Id);

    $('#empresasSelectTxt option').each(function () {
        var key = $(this).val();               
        clientesSelecionados.push(key);
    });

    grupoOriginal = {
        Nome: dataItem.Nome,
        Descricao: dataItem.Descricao,
        Clientes: clientesSelecionados
    };

    $('#modalEditGrupo').modal({ backdrop: 'static', keyboard: false });
    $('#modalEditGrupo .modal-dialog .modal-header center .modal-title strong').html("");
    $('#modalEditGrupo .modal-dialog .modal-header center .modal-title strong').html("Editar Grupo de Empresas");

    $("#loading-page").hide();
}

/*Fill available Branchs*/
function PesquisarClientes(idGrupo) {
    $("#loading-page").show();
    var dataCNPJ = undefined;
    var idInscricao = $('#tbIdInscricao').val();
    $.ajax({
        url: "/Grupos/PesquisarClientes",
        type: "GET",
        async: false,
        dataType: "json",
        cache: false,
        data: { "idInscricao": idInscricao, "idGrupo": idGrupo },
        success: function (result) {
            dataCNPJ = result.Data;
            dataExistingCNPJ = result.Data2;
            if (result.Sucesso) {
                for(i = 0; i < dataCNPJ.length;++i){
                    $('#empresasTxt').append('<option value="' + (dataCNPJ[i]).value + '">' + (dataCNPJ[i]).text + '</option>');
                }
                for (i = 0; i < dataExistingCNPJ.length; ++i) {
                    $('#empresasSelectTxt').append('<option value="' + (dataExistingCNPJ[i]).value + '">' + (dataExistingCNPJ[i]).text + '</option>');
                }
            }
            else {
                ShowModalAlerta(result.Msg);
            }            
        }
    });
}

/*Move branch from listBox(empresasTxt) to AddListBox(empresasSelectTxt)*/
function AdicionarCliente() {
    var duplicada = false;
    $("#empresasTxt :selected").each(function (index, itemFilial) {
        $("#empresasSelectTxt > option").each(function () {
            if (itemFilial.value == this.text) {
                ShowModalAlerta("Esta empresa já foi selecionada.");
                duplicada = true;
                return false;
            }
        });

        if (duplicada == false) {
            $('#empresasSelectTxt').append('<option value="' + itemFilial.value + '" selected="selected" >' + itemFilial.label + '</option>');
            OrdenarListBox('#empresasSelectTxt');
            $('#empresasTxt :selected').remove();
        }
    });
}

/*Move branch from AddListBox(empresasSelectTxt) to listBox(empresasTxt)*/
function RemoverCliente() {
    var duplicada = false;
    $('#empresasSelectTxt :selected').each(function (index, itemFilialSelecionada) {
        $("#empresasTxt > option").each(function () {
            if (itemFilialSelecionada.value == this.text) {
                duplicada = true;
                return false;
            }
        });

        if (duplicada == false) {
            $('#empresasTxt').append('<option value="' + itemFilialSelecionada.value + '"  >' + itemFilialSelecionada.label + '</option>');
            OrdenarListBox('#empresasTxt');
        }
    });

    $('#empresasSelectTxt :selected').remove();
}

/*Save group (button inside Add/Edit)*/
function SaveGroup(urlType) {
    var msgAlert = undefined;
    var newGrupo = [];
    var newFiliais = [];
    var editedBranches = [];

    var id = $('#idTxt').val();
    var nome = $('#nomeTxt').val();
    var desc = $('#descTxt').val();
    var msgValidacao = '';
        
    $('#empresasSelectTxt option').each(function () {
        var key = $(this).val();
        var value = $(this).contents().first().text();
        editedBranches.push(key + '|' + value);
        newFiliais.push(key);
    });

    var idInscricao = $('#tbIdInscricao').val();

    switch (urlType) {
        case "Add":
            urlType = '/Grupos/Incluir';
            msgAlert = 'cadastrado';
            newGrupo.push({
                nome: nome,
                desc: desc,
                filiais: newFiliais,
                filial: idInscricao
            });
            break;
        case "Edit":
            urlType = '/Grupos/Editar';
            msgAlert = 'alterado';
            newGrupo.push({
                Id: id,
                nome: nome,
                desc: desc,
                filiais: newFiliais,
                filiaisMap: editedBranches,
                filial: idInscricao
            });
            break;
    }

    msgValidacao = ValidarCamposObrigatorios(newGrupo);

    if(msgValidacao == '')
    {
        $("#loading-page").show();

        $.ajax({
            url: urlType,
            data: JSON.stringify(newGrupo[0]),
            type: 'POST',
            async: false,
            contentType: 'application/json; charset=utf-8',
            success: function (devPro) {
                var obj = JSON.parse(devPro);
                if (obj.indexOf("MSG:") > -1) {
                    $("#loading-page").hide();
                    var msg = obj.replace("MSG: ", "");
                    ShowModalAlerta(msg + "!");
                }
                else {
                    $("#loading-page").hide();
                    $('#modalEditGrupo').modal('hide');
                    ShowModalSucesso("Grupo " + msgAlert + " com sucesso!");
                    LoadDsGrid($('#tbIdInscricao').val());
                }
            }
        });       
    }
    else
    {
        ShowModalAlerta(msgValidacao);
    }
}

function ValidarCamposObrigatorios(newGrupo)
{
    var msg = '';

    if (newGrupo[0].nome == '') {
        if (msg != '') msg += '<br>';
        msg += 'Favor informar o Nome do Grupo';
    }
    
    if (newGrupo[0].filiais.length == 0) {
        if (msg != '') msg += '<br>';
        msg += 'Favor selecionar alguma Filial';
    }        

    return msg;
}