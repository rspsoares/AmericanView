var usuarioOriginal = [];
function CarregaComponentes() {
    LoadDsGrid();
    LoadProfiles();
    FillGroups(1, [], true);
    FormValidationRules();

    $('#btnIncluirUsr').click(function () {
        IncluirUsuario();
    });

    $('#btnPesquisarUsuarios').click(function () {
        BuscarDadosGrid();
    });

    $('#btnLimparPequisa').click(function () {
        var dropdownlist;

        document.getElementById("txtNomeFiltro").value = "";
        document.getElementById("txtLoginFiltro").value = "";
        document.getElementById("txtEmailFiltro").value = "";

        dropdownlist = $("#selectPerfilFiltro").data("kendoDropDownList");
        dropdownlist.select(0);

        dropdownlist = $("#selectStatusFiltro").data("kendoDropDownList");
        dropdownlist.select(0);

        BuscarDadosGrid();
    });

    $('#txtNomeFiltro').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            BuscarDadosGrid();
        }
    });

    $('#txtLoginFiltro').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            BuscarDadosGrid();
        }
    });

    $('#txtEmailFiltro').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            BuscarDadosGrid();
        }
    });
}

function LoadDsGrid() {
    var datasource = undefined;
    $.ajax({
        url: "/Usuarios/PesquisarUsuarios",
        type: "GET",
        async: false,
        dataType: "json",
        cache: false,
        success: function (result) {
            datasource = result;
            GridUsuarios(datasource);
        }
    });
}

function GridUsuarios(ds) {
    $("#grid").kendoGrid({
        dataSource: {
            data: ds,
            pageSize: 8
        },
        scrollable: true,
        sortable: true,
        resizable: true,
        pageable: {
            pageSizes: [10, 25, 50]
        },
        columns: [
            { field: "Id", hidden: true },
            { field: "Login", hidden: true },
            { field: "Email", hidden: true },
            { field: "Bloqueado", hidden: true },
            { field: "Nome", title: "Nome" },
            { field: "Perfil", title: "Perfil" },
            { field: "Status", title: "Status" },
            {
                title: " ",
                template: "<a onclick='javascript:{EditarUsuario(this, true);}' class='k-button'>"
                    + "<span class='glyphicon glyphicon glyphicon-search'></span></a>",
                width: "48px",
                filterable: false
            },
            {
                title: " ",
                template: "<a onclick='javascript:{EditarUsuario(this, false);}' class='k-button'>"
                    + "<span class='glyphicon glyphicon-pencil'></span></a>",
                width: "48px",
                filterable: false
            }
        ]
    });

    AutoComplete();
    CarregarFiltroStatus();
    CarregarFiltroPerfil();
    CarregarFiltroBloqueado();
}

function AutoComplete() {
    var kgrid = $("#grid").data("kendoGrid");
    var dsOld = kgrid.dataSource.data();
    var dsNome = [];
    var dsLogin = [];
    var dsMail = [];

    //// Usuários
    for (var i in dsOld) {
        if (dsNome.indexOf(dsOld[i].Nome) == -1 && dsOld[i].Nome != undefined) {
            dsNome.push("" + dsOld[i].Nome + "");
        }
        if (dsLogin.indexOf(dsOld[i].Login) == -1 && dsOld[i].Login != undefined) {
            dsLogin.push("" + dsOld[i].Login + "");
        }
        if (dsMail.indexOf(dsOld[i].Email) == -1 && dsOld[i].Email != undefined) {
            dsMail.push("" + dsOld[i].Email + "");
        }
    }

    $("#txtNomeFiltro").kendoAutoComplete({
        dataSource: dsNome,
        filter: "startswith",
        placeholder: "Nome"
    });
    $("#txtLoginFiltro").kendoAutoComplete({
        dataSource: dsLogin,
        filter: "startswith",
        placeholder: "Login"
    });
    $("#txtEmailFiltro").kendoAutoComplete({
        dataSource: dsMail,
        filter: "startswith",
        placeholder: "E-Mail"
    });
}

function CarregarFiltroPerfil() {
    var kgrid = $("#grid").data("kendoGrid");
    var dsStatus = new kendo.data.DataSource({
        data: kgrid.dataSource.data(),
        group: { field: "Perfil", dir: "asc" }
    });
    $('#selectPerfilFiltro').kendoDropDownList({
        dataTextField: "value",
        dataValueField: "value",
        dataSource: dsStatus,
        optionLabel: "Escolha ...",
        index: 0
    });
}

function CarregarFiltroStatus() {
    var kgrid = $("#grid").data("kendoGrid");
    var dsStatus = new kendo.data.DataSource({
        data: kgrid.dataSource.data(),
        group: { field: "Status", dir: "asc" }
    });
    $('#selectStatusFiltro').kendoDropDownList({
        dataTextField: "value",
        dataValueField: "value",
        dataSource: dsStatus,
        optionLabel: "Escolha ...",
        index: 0
    });
}

function CarregarFiltroBloqueado() {
    var kgrid = $("#grid").data("kendoGrid");
    var dsStatus = new kendo.data.DataSource({
        data: kgrid.dataSource.data(),
        group: { field: "Bloqueado", dir: "asc" }
    });
    $('#selectBloqueadoFiltro').kendoDropDownList({
        dataTextField: "value",
        dataValueField: "value",
        dataSource: dsStatus,
        optionLabel: "Escolha ...",
        index: 0
    });
}

/*Método de controle de modal e edição*/
/*Show modal for user creation*/
function IncluirUsuario() {
    usuarioOriginal = {
        Nome: '',
        Login: '',
        Email: '',
        Telefone: '',
        Ativo: true,
        Perfil: '',
        Inscricao: '',
        Grupos: []
    };

    $('#idUsuario').val("0");
    $('#uqUsuario').val('');
    $('#txtNome').val('');
    $('#txtLogin').val('');
    $('#txtEmail').val('');
    $('#txtTel').val('');

    LoadProfiles();
    //LoadAccounts(false);
    LoadGroups(1, true);
    $('#selectGrupoUsr').data("kendoMultiSelect").value([]);
    ToggleSaveActivation(false);
   
    $('#btnVoltar').hide();
    $('#btnEditar').hide();
    $('#btnReenvioEmail').hide();
    $('#btnCancelar').show();
    $('#btnSalvar').show();

    $('#modalEditarUsuario').modal({ backdrop: 'static', keyboard: false });
    $('#modalEditarUsuario .modal-dialog .modal-header center .modal-title strong').html("");
    $('#modalEditarUsuario .modal-dialog .modal-header center .modal-title strong').html("Incluir Usuário");

    $("#loading-page").hide();
}

/*Load available profiles for user creation*/
function LoadProfiles() {
    var dataPerfil = [
        { text: "Nenhum Perfil", value: "0" }
    ];
    var selectedValue = 0;

    $.ajax({
        url: "/Usuarios/BuscarPerfis",
        type: "GET",
        async: false,
        dataType: "json",
        cache: true,
        success: function (result) {
            if (result.Sucesso)
                dataPerfil = result.Data;
            else {
                ShowModalAlerta(result.Data);
                selectedValue = 0;
            }
        }
    });

    $('#selectPerfilUsr').kendoDropDownList({
        dataTextField: "text",
        dataValueField: "value",
        dataSource: dataPerfil,
        value: selectedValue,
        optionLabel: "Escolha ...",
        select: function (e) {
            //var dataItem = this.dataItem(e.item.index());
          //  HandleProfileChange(dataItem);
        }
    });
}

/*Load accounts data for type 'Client' */
function LoadAccounts(isToBeGenerated) {
    var dataAccounts = [
        { text: "Nenhuma Conta", value: "0" }
    ];

    if (isToBeGenerated) {
        $.ajax({
            url: "/Usuarios/BuscarInscricoes",
            type: "GET",
            async: false,
            dataType: "json",
            cache: true,
            success: function (result) {
                if (result.Sucesso) {
                    dataAccounts = result.Data;
                }
                else {
                    ShowModalAlerta(result.Data);
                    isToBeGenerated = false;
                }
            }
        });
    }
}

/*Load available groups for 'Account' */
function LoadGroups(selectedAccount, isToBeGenerated) {
    var dataGroups = [];

    if (isToBeGenerated) {
        $.ajax({
            contentType: "application/json",
            url: "/Usuarios/BuscarGrupos",
            type: "GET",
            async: false,
            dataType: "json",
            cache: false,
            data: { "conta": selectedAccount },
            success: function (result) {
                if (result.Sucesso)
                    dataGroups = result.Data;
                else {
                    ShowModalAlerta(result.Data);
                    isToBeGenerated = false;
                }
            }
        });
    }

    InitializeGroupKendoMultiSelect(dataGroups);
    ToggleGroupsEnableSelection(isToBeGenerated);
}

/*Initialize component as to prevent duplication*/
function InitializeGroupKendoMultiSelect(ds) {
    var multiSelectGroups = $("#selectGrupoUsr").data("kendoMultiSelect");
    if (typeof (multiSelectGroups) != "undefined") {
        multiSelectGroups.setDataSource(ds);
    }
    else {
        $("#selectGrupoUsr").kendoMultiSelect({
            placeholder: "Escolha ...",
            dataSource: ds,
            dataTextField: "text",
            dataValueField: "value",
            change: function (e) {
                HandleGroupChange();
            }
        });
    }
}

/*Enable/Disable the groups selection*/
function ToggleGroupsEnableSelection(toggle) {
    var multiSelectGroups = $("#selectGrupoUsr").data("kendoMultiSelect");
    if (typeof (multiSelectGroups) != "undefined") {
        if (toggle)
            multiSelectGroups.enable();
        else
            multiSelectGroups.enable(false);
    }
}

/*Enable or Disable Save button*/
function ToggleSaveActivation(isToActivate) {
    if (isToActivate)
        $('#btnSalvar').removeAttr('disabled');
    else
        $('#btnSalvar').attr('disabled', 'disabled');
}

/*Add user creation form validation rules*/
function FormValidationRules() {
    $('#userFormEdit').validate({
        rules: {
            txtTelCriar: {
                digits: true
            },
            txtEmailCriar: {
                email: true
            }
        },
        messages: {
            txtTelCriar: {
                digits: "Apenas números",
                minlength: 8
            },
            txtLoginCriar: {
                minlength: "Mínimo 2 letras"
            }
        }
    });
}

function EditarUsuario(e, locked) {
    var dataItem = $("#grid").data("kendoGrid").dataItem(e.parentElement.parentElement);
    var tituloTela = '';
    $("#loading-page").show();


    $.ajax({
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        dataType: "json",
        url: "/Usuarios/GetEditableUser",
        data: { "id": dataItem.Id },
        cache: false,
        async: false,
        success: function (result) {
            if (result.Sucesso) {
                $('#btnAccountSearch').attr('disabled', 'disabled');
                CarregarDadosUsuario(result.Data);
                //LoadDsInscricoes();
                FillProfile(result.Data.GrupoPerfil, true);
                //FillAccount(result.Data.Conta, result.Data.Conta == 0 ? false : true);

                if (result.Data.GrupoEmpresasDetails != null) {
                    FillGroups(result.Data.idInscricao, (result.Data.GrupoEmpresasDetails).length > 0 ? result.Data.GrupoEmpresasDetails : undefined, result.Data.idInscricao == 0 ? false : true);
                }
                else {
                    FillGroups(result.Data.idInscricao, undefined, false);
                }

                usuarioOriginal = {
                    Nome: result.Data.Nome,
                    Login: result.Data.Login,
                    Email: result.Data.Email,
                    Telefone: result.Data.Telefone,
                    Ativo: result.Data.ContaAtivada,
                    Perfil: result.Data.GrupoPerfil,
                    Inscricao: result.Data.idInscricao,
                    Grupos: result.Data.GrupoEmpresasDetails
                };
            }
            else {
                ShowModalAlerta('Estes dados não podem ser exibidos!');
                return;
            }
        }
    });

    if (locked) {
        $('#btnVoltar').show();
        $('#btnEditar').show();
        $('#btnReenvioEmail').hide();
        $('#btnCancelar').hide();
        $('#btnSalvar').hide();

        tituloTela = 'Usuário';
    }
    else {
        $('#btnVoltar').hide();
        $('#btnEditar').hide();
        $('#btnReenvioEmail').show();
        $('#btnCancelar').show();
        $('#btnSalvar').show();

        tituloTela = 'Editar Usuário'
    }

    $('#modalEditarUsuario .modal-dialog .modal-header center .modal-title strong').html("");
    $('#modalEditarUsuario .modal-dialog .modal-header center .modal-title strong').html(tituloTela);
    $('#modalEditarUsuario').modal({ backdrop: 'static', keyboard: false });

    TravarCamposTela(locked);

    $("#loading-page").hide();
}

function EditarVisualizacaoUsuario() {
    $('#btnVoltar').hide();
    $('#btnEditar').hide();
    $('#btnReenvioEmail').show();
    $('#btnCancelar').show();
    $('#btnSalvar').show();

    $('#modalEditarUsuario .modal-dialog .modal-header center .modal-title strong').html("");
    $('#modalEditarUsuario .modal-dialog .modal-header center .modal-title strong').html("Editar Usuário");

    TravarCamposTela(false);
}

function TravarCamposTela(locked) {
    document.getElementById('txtNome').readOnly = locked
    document.getElementById('txtLogin').readOnly = locked
    document.getElementById('txtEmail').readOnly = locked
    document.getElementById('txtTel').readOnly = locked

    var selectPerfilUsr = $('#selectPerfilUsr').data('kendoDropDownList');
    selectPerfilUsr.enable(!locked);

    //var selectInscrlUsr = $('#selectInscrlUsr').data('kendoDropDownList');
    //selectInscrlUsr.enable(!locked);

    var selectGrupoUsr = $("#selectGrupoUsr").data("kendoMultiSelect");
    selectGrupoUsr.enable(!locked);
}

/*Preenchimento dos dados do usuário*/
function CarregarDadosUsuario(dataItem) {
    $('#idUsuario').val(dataItem.Id);
    $('#uqUsuario').val(dataItem.UKusuario);
    $('#txtNome').val(dataItem.Nome);
    $('#txtLogin').val(dataItem.Login);
    $('#txtEmail').val(dataItem.Email);
    $('#txtTel').val(dataItem.Telefone);
    //$('#tbIdInscricao').val(dataItem.idInscricao);
    //$('#lbInscricaoSelecionada').text(dataItem.descricaoInscricao);
}

/*Fill dropdownlist for profile and select its current value*/
function FillProfile(currentProfile, isToBeGenerated) {
    //basic data for empty profile
    var dataprofiles = [
        { text: "Nenhum Perfil", value: "0" }
    ];

    if (isToBeGenerated) {
        $.ajax({
            url: "/Usuarios/BuscarPerfis",
            type: "GET",
            async: false,//it is necessary if we want to set sincronously
            dataType: "json",
            cache: true,
            success: function (result) {
                if (result.Sucesso) {
                    dataprofiles = result.Data;
                }
                else {
                    ShowModalAlerta(result.Data);
                    currentProfile = 0;
                    isToBeGenerated = false;
                }
            }
        });
    }
    else {
        //force it show empty data value
        currentProfile = 0;
    }

    $('#selectPerfilUsr').kendoDropDownList({
        dataTextField: "text",
        dataValueField: "value",
        value: currentProfile,
        enable: isToBeGenerated,
        optionLabel: "Escolha ...",
        dataSource: dataprofiles,
        select: function (e) {//AFTER a new Profile get selected
            //var dataItem = this.dataItem(e.item.index());
           
        }
    });

    var dataItem = [
        {
            text: $('#selectPerfilUsr').data('kendoDropDownList').text(),
            value: $('#selectPerfilUsr').data('kendoDropDownList').value()
        }
    ];

    HandleProfileChange(dataItem[0]);
}

/*Fill multipleselect for the account group and select its current value(s)*/
function FillGroups(currentAccount, currentGroups, isToBeGenerated) {
    //basic data for empty groups
    var datagroups = [];

    //if (isToBeGenerated) {
        $.ajax({
            contentType: "application/json",
            url: "/Usuarios/BuscarGrupos",
            type: "GET",
            async: false,
            dataType: "json",
            cache: true,
            data: { "conta": currentAccount },
            success: function (result) {
                if (result.Sucesso) {
                    datagroups = result.Data;
                }
                else {
                    ShowModalAlerta(result.Data);
                    isToBeGenerated = false;
                }
            }
        });
    //}

    var selectGrupoUsr = $("#selectGrupoUsr").data("kendoMultiSelect");

    if (isToBeGenerated) {
        selectGrupoUsr.setDataSource(datagroups);
        selectGrupoUsr.enable();
        if (currentGroups != undefined)
            selectGrupoUsr.value(currentGroups);
    }
    else {
        selectGrupoUsr.value([]);
        selectGrupoUsr.enable(false);
    }
}

/*Check actions to be taken for selected profile*/
function HandleProfileChange(dataItem) {
    FillGroups(0, [], false);//clean selected groups
    $('#btnAccountSearch').attr('disabled', 'disabled');
    DisableAccountVisibility();
    if (dataItem.text == "Suporte" || dataItem.text == "Usuários") {
        //ToggleUpdateActivation(false);
         //FillAccount(0, true);
        $('#btnAccountSearch').removeAttr('disabled');
    }
    else {
        if (dataItem.value == 0)//return to root index
        {
            ToggleUpdateActivation(false);
        }
        else {
            //Users other than clients can be created without an account
            ToggleUpdateActivation(true);
        }
    }
}

/*Check actions to be taken for groups when changed*/
function HandleGroupChange() {
    var multiSelectGroups = $("#selectGrupoUsr").data("kendoMultiSelect");
    if ((multiSelectGroups.value()).length > 0)
        ToggleUpdateActivation(true);
    else
        ToggleUpdateActivation(false);
}

/*Enable or Disable Save button*/
function ToggleUpdateActivation(isToActivate) {
    if (isToActivate)
        $('#btnSalvar').removeAttr('disabled');
    else
        $('#btnSalvar').attr('disabled', 'disabled');
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

    if (selectedItem != null) {
        $('#tbIdInscricao').val(selectedItem.Id);
        var inscricao = "Conta: " + selectedItem.Nome + " - Descrição: " + selectedItem.Descricao;
        $("#lbInscricaoSelecionada").text(inscricao);
    }
    else {
        ShowModalAlerta('Nenhuma Conta foi selecionada.');
        $("#lbInscricaoSelecionada").text("Favor selecionar uma Conta.");
    }


    ToggleUpdateActivation(true);
    FillGroups(selectedItem.Id, [], true);

    $('#modalInscricoes').modal('hide');
}

/*Analyze profile for (inside out)administrator stats*/
function HasProfileAdministrationStatus() {
    var analisysResult = undefined;
    var profiledropdownlist = $('#selectPerfilUsr').data('kendoDropDownList');
    var currentProfile = profiledropdownlist.value();
    $.ajax({
        contentType: "application/json",
        url: "/Usuarios/InfoPerfil",
        type: "GET",
        async: false,
        dataType: "json",
        cache: true,
        data: { "perfil": currentProfile },
        success: function (result) {
            if (result.Sucesso)
                analisysResult = result.Data;
            else {
                ShowModalAlerta(result.Data);
                analisysResult = true;
            }
        }
    });
    return analisysResult;
}

/*Disable account visibility*/
function DisableAccountVisibility() {
    var txtBtn = $("#btnAccountSearch").val();
    if (txtBtn == "Ocultar") {
        $("#gridInscricoes").toggle("slow");
        $("#btnAccountSearch").val("Pesquisar");
    }
}

/*Método de reenvio de requisição de confirmação para cliente*/
function ReenviarEmailUsuario() {
    var uqusuario = $('#uqUsuario').val();
    $.ajax({
        contentType: "application/json",
        url: "/Usuarios/ReenviarEmail",
        type: "POST",
        async: true,
        dataType: "json",
        cache: false,
        data: JSON.stringify({ idusuario: uqusuario, emailUsuario: '' }),
        success: function (result) {
            if (result.sucesso) {
                ShowModalSucesso(result.msg);
            }
        }
    });
}

//function VerificarCancelarEdicao() {
//    var dataHTML = "";

//    var usuarioAtual = {
//        Nome: $('#txtNome').val(),
//        Login: $('#txtLogin').val(),
//        Email: $('#txtEmail').val(),
//        Telefone: $('#txtTel').val(),
//        Ativo: $('#selectStatusUsr').bootstrapSwitch('state'),
//        Perfil: $('#selectPerfilUsr').data('kendoDropDownList').value(),
//        Inscricao: 1,
//        Grupos: $('#selectGrupoUsr').data('kendoMultiSelect').value()
//    };

//    if (VerificarCampoAlterado(usuarioAtual) == true) {
//        dataHtml = '<div class="row">'
//                   + '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">'
//                       + 'As alterações serão perdidas. Deseja mesmo cancelar?'
//                   + '</div>'
//                 + '</div>';

//        $('#modalCancelarEdicao').modal({ backdrop: 'static', keyboard: false });
//        $('#modalCancelarEdicao .modal-dialog .modal-body').html("");
//        $('#modalCancelarEdicao .modal-dialog .modal-body').html(dataHtml);
//    }
//    else {
//        $('#modalCancelarEdicao').modal('hide');
//        $('#modalEditarUsuario').modal('hide');
//    }
//}

//function VerificarCampoAlterado(usuarioAtual) {
//    if (usuarioAtual.Nome != usuarioOriginal.Nome) return true;
//    if (usuarioAtual.Login != usuarioOriginal.Login) return true;
//    if (usuarioOriginal.Email != null && usuarioAtual.Email != usuarioOriginal.Email) return true;
//    if (usuarioOriginal.Telefone != null && usuarioAtual.Telefone != usuarioOriginal.Telefone) return true;
//    if (usuarioAtual.Ativo != usuarioOriginal.Ativo) return true;
//    if (usuarioAtual.Perfil != usuarioOriginal.Perfil) return true;
//    //if (usuarioAtual.Inscricao != usuarioOriginal.Inscricao) return true;
//    if (usuarioOriginal.Grupos != null && jQuery.compare(usuarioAtual.Grupos, usuarioOriginal.Grupos) == false) return true;

//    return false;
//}

function SalvarUsuario() {
    $("#loading-page").show();

    if ($('#idUsuario').val() == "0")
        SaveUserCreation();
    else
        UpdateUserEditing();

    $("#loading-page").hide();
}

/* Save filled data to a new user on system*/
function SaveUserCreation() {
    var idPerfil = '0';
    var form = $("#usuarioForm");
    form.validate();

    if ($('#selectPerfilUsr').data('kendoDropDownList').value() != '')
        idPerfil = $('#selectPerfilUsr').data('kendoDropDownList').value();

    if (form.valid()) {
        var usuario = {
            Nome: $('#txtNome').val(),
            Login: $('#txtLogin').val(),
            Email: $('#txtEmail').val(),
            Telefone: $('#txtTel').val(),
            Ativo: $('#selectStatusUsr').bootstrapSwitch('state'),
            Perfil: idPerfil,
            Inscricao: 1,
            Grupos: $('#selectGrupoUsr').data('kendoMultiSelect').value()
        };

        $.ajax({
            contentType: "application/json",
            url: "/Usuarios/CriarUsuario",
            type: "POST",
            async: true,
            dataType: "json",
            data: JSON.stringify({ "nome": usuario.Nome, "login": usuario.Login, "email": usuario.Email, "telefone": usuario.Telefone, "ativo": usuario.Ativo, "perfil": usuario.Perfil, "inscricao": usuario.Inscricao, "grupos": usuario.Grupos }),
            success: function (result) {
                if (result.sucesso) {
                    $("#loading-page").hide();
                    $('#modalEditarUsuario').modal('hide');
                    ShowModalSucesso(result.msg);
                    $("#grid").html("");
                    LoadDsGrid();
                }
                else {
                    ShowModalAlerta(result.msg);
                }
            }
        });
    }
    else {
        ShowModalAlerta('Ajustes os campos marcados antes de Salvar!');
    }
}

/*Save changed data to user*/
function UpdateUserEditing() {
    var idPerfil = '0';
    var form = $("#usuarioForm");
    form.validate();
    if (form.valid()) {
        if ($('#selectPerfilUsr').data('kendoDropDownList').value() != '')
            idPerfil = $('#selectPerfilUsr').data('kendoDropDownList').value();

        var usuario = {
            IdUser: $('#idUsuario').val(),
            UQUser: $('#uqUsuario').val(),
            Nome: $('#txtNome').val(),
            Login: $('#txtLogin').val(),
            Email: $('#txtEmail').val(),
            Telefone: $('#txtTel').val(),
            Ativo: $('#selectStatusUsr').bootstrapSwitch('state'),
            Perfil: idPerfil,
            Inscricao: 1,
            Grupos: $('#selectGrupoUsr').data('kendoMultiSelect').value()
        };

        $.ajax({
            contentType: "application/json",
            url: "/Usuarios/AtualizarUsuario",
            type: "POST",
            async: true,
            dataType: "json",
            data: JSON.stringify({ "nome": usuario.Nome, "login": usuario.Login, "email": usuario.Email, "telefone": usuario.Telefone, "ativo": usuario.Ativo, "perfil": usuario.Perfil, "inscricao": usuario.Inscricao, "grupos": usuario.Grupos, "iduser": usuario.IdUser, "uquser": usuario.UQUser }),
            success: function (result) {
                if (result.sucesso) {
                    $("#loading-page").hide();
                    $('#modalEditarUsuario').modal('hide');
                    ShowModalSucesso(result.msg);
                    $("#grid").html("");
                    LoadDsGrid();
                }
                else {
                    ShowModalAlerta(result.msg);
                }
            }
        });
    }
    else {
        ShowModalAlerta('Ajustes os campos marcados antes de Salvar!');
    }
}