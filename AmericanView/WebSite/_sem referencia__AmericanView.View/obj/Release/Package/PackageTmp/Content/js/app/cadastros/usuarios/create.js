/*Loading basic data for user creation*/
function LoadComponentsForUserCreation() {
    LoadProfiles();    
    LoadAccounts(false);    
    LoadGroups(0, false);
    ToggleSaveActivation(false);
    FormValidationRules();
    InitializeAccountListingGrid();

    $('#btnAccountSearchCriar').click(function () {
        $("#gridGroupAccount").toggle("slow");
        var txtBtn = $("#btnAccountSearchCriar").val();
        if (txtBtn == "Pesquisar")
            $("#btnAccountSearchCriar").val("Ocultar");
        else 
            $("#btnAccountSearchCriar").val("Pesquisar");
    });
}

/*Initialize Account Grid*/
function InitializeAccountListingGrid() {
    $('#gridGroupAccount').kendoGrid({
        dataSource: {
            data: GetAvailableAccounts(),
            schema: {
                model: {
                    fields: {
                        Id: { type: "number" },
                        Nome: { type: "string" },
                        Descricao: { type: "string" }
                    }
                }
            },
            pageSize: 10
        },
        filterable: {
            mode: "row",
            operators: {
                string: {
                    contains: "Contém"
                }
            }
        },
        selectable: true,
        scrollable: false,
        change: onSelectedAccount,
        pageable: {
            pageSizes: [10, 25, 50]
        },
        columns: [
            { field: "Id", hidden: true },
            {
                field: "Nome",
                title: "Conta",
                width: '25%',
                filterable: {
                    cell: {
                        operator: "contains"
                    }
                }
            },
            {
                field: "Descricao",
                title: "Descrição",
                width: '75%',
                filterable: {
                    cell: {
                        operator: "contains"
                    }
                }
            }
        ]
    });
}

/*Returns Accounts data*/
function GetAvailableAccounts() {
    var datasource = undefined;
    var gridIsToBeFilled = true;

    $.ajax({
        url: "/Grupos/GetAvailableAccounts",
        type: "GET",
        dataType: "json",
        async: false,
        success: function (result) {
            if (result.Data) {
                datasource = result.Data;
            }
            else {
                gridIsToBeFilled = false;
                ShowModalAlerta(result.Msg);
            }
        }
    });

    if (gridIsToBeFilled) {
        return datasource;
    }
    else {
        return '[]';
    }
}

/*Account selection event*/
function onSelectedAccount(arg) {
    var entityGrid = $("#gridGroupAccount").data("kendoGrid");
    var selectedItem = entityGrid.dataItem(entityGrid.select());
    var ddlAccount = $('#selectInscrlUsrCriar').data("kendoDropDownList");
    ddlAccount.value(selectedItem.Id);

    if (HasProfileAdministrationStatus())
        ToggleSaveActivation(true);
    else
        LoadGroups(selectedItem.Id, true);
}

/*Load available profiles for user creation*/
function LoadProfiles() {
    var dataPerfil = [
        {text: "Nenhum Perfil", value: "999"}
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
            else
            {
                ShowModalAlerta(result.Data);
                selectedValue = 999;
            }                
        }
    });

    $('#selectPerfilUsrCriar').kendoDropDownList({
        dataTextField: "text",
        dataValueField: "value",
        dataSource: dataPerfil,
        value: selectedValue,
        optionLabel: "Escolha ...",
        select: function (e) {
            var dataItem = this.dataItem(e.item.index());
            HandleProfileChange(dataItem);
        }
    });
}

/**/
function DisableAccountVisibility() {
    var txtBtn = $("#btnAccountSearchCriar").val();
    if (txtBtn == "Ocultar") {
        $("#gridGroupAccount").toggle("slow");
        $("#btnAccountSearchCriar").val("Pesquisar");
    }
}

/*Check actions to be taken for selected profile*/
function HandleProfileChange(dataItem) {
    LoadGroups(0, false);//clean selected groups
    LoadAccounts(false);//clean selected account
    $('#btnAccountSearchCriar').attr('disabled', 'disabled');
    DisableAccountVisibility();
    //Client profiles has 'Client' in its description
    if ((dataItem.text).equals("Suporte") || (dataItem.text).equals("Usuários")) {
        ToggleSaveActivation(false);
        LoadAccounts(true);
        $('#btnAccountSearchCriar').removeAttr('disabled');
    }
    else {        
        if (dataItem.value == 0)//return to root index
            ToggleSaveActivation(false);
        else//Users other than clients can be created without an account
            ToggleSaveActivation(true);

    }
}

/*Load accounts data for type 'Client' */
function LoadAccounts(isToBeGenerated) {
    var dataAccounts = [
        { text: "Nenhuma Conta", value: "999" }
    ];

    if (isToBeGenerated) {
        $.ajax({
            url: "/Usuarios/BuscarInscricoes",
            type: "GET",
            async: false,
            dataType: "json",
            cache: true,
            success: function (result) {
                if (result.Sucesso){
                    dataAccounts = result.Data;
                }                    
                else {
                    ShowModalAlerta(result.Data);
                    isToBeGenerated = false;
                }                    
            }
        });
    }

    $('#selectInscrlUsrCriar').kendoDropDownList({
        dataTextField: "text",
        dataValueField: "value",
        optionLabel: "Escolha ...",
        index: 0,
        dataSource: dataAccounts,
        select: function (e) {
            var dataItem = this.dataItem(e.item.index());
            HandleAccountChange(dataItem);
        }
    });

    var accountdropdownList = $('#selectInscrlUsrCriar').data('kendoDropDownList');

    if (isToBeGenerated)
        accountdropdownList.enable();
    else
        accountdropdownList.enable(false);
}

/*Check actions to be taken for selected account*/
function HandleAccountChange(dataItem) {
    if (dataItem.value > 0)
    {
        if (HasProfileAdministrationStatus())
            ToggleSaveActivation(true);
        else
            LoadGroups(dataItem.value, true);
    }        
    else {
        LoadGroups(0, false);
    }        
}

/*Initialize component as to prevent duplication*/
function InitializeGroupKendoMultiSelect(ds) {
    var multiSelectGroups = $("#selectGrupoUsrCriar").data("kendoMultiSelect");
    if (typeof (multiSelectGroups) != "undefined") {
        multiSelectGroups.setDataSource(ds);
    }
    else {
        $("#selectGrupoUsrCriar").kendoMultiSelect({
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
    var multiSelectGroups = $("#selectGrupoUsrCriar").data("kendoMultiSelect");
    if(typeof (multiSelectGroups) != "undefined"){
        if (toggle)
            multiSelectGroups.enable();
        else
            multiSelectGroups.enable(false);
    }
}

/*Load available groups for 'Account' */
function LoadGroups(selectedAccount,isToBeGenerated) {
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

/*Check actions to be taken for groups when changed*/
function HandleGroupChange() {
    var multiSelectGroups = $("#selectGrupoUsrCriar").data("kendoMultiSelect");
    if ((multiSelectGroups.value()).length > 0)
        ToggleSaveActivation(true);
    else
        ToggleSaveActivation(false);
}

/* Save filled data to a new user on system*/
function SaveUserCreation() {
    var form = $("#usuarioForm");
    form.validate();

    if (form.valid()) {
        var usuario = {
            Nome: $('#txtNomeCriar').val(),
            Login: $('#txtLoginCriar').val(),
            Email: $('#txtEmailCriar').val(),
            Telefone: $('#txtTelCriar').val(),
            Ativo: $('#selectStatusUsrCriar').bootstrapSwitch('state'),
            Perfil: $('#selectPerfilUsrCriar').data('kendoDropDownList').value(),
            Inscricao: $('#selectInscrlUsrCriar').data('kendoDropDownList').value(),
            Grupos: $('#selectGrupoUsrCriar').data('kendoMultiSelect').value()
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
                    $('#adicionarUsuarioModal').modal('hide');
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

/*Enable or Disable Save button*/
function ToggleSaveActivation(isToActivate) {
    if (isToActivate)
        $('#btnSalvarCriar').removeAttr('disabled');
    else
        $('#btnSalvarCriar').attr('disabled', 'disabled');
}

/*Add user creation form validation rules*/
function FormValidationRules() {
    $('#usuarioForm').validate({
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

/*Clean filled date for created user*/
function CleanUserForm() {
    $('#txtNomeCriar').val('');
    $('#txtLoginCriar').val('');
    $('#txtEmailCriar').val('');
    $('#txtTelCriar').val('');
    LoadProfiles();
    LoadAccounts(false);
    LoadGroups(0, false);
    ToggleSaveActivation(false);
}

/*Analyze profile for (inside out)administrator stats*/
function HasProfileAdministrationStatus() {
    var analisysResult = undefined;
    var profiledropdownlist = $('#selectPerfilUsrCriar').data('kendoDropDownList');
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

/*Show Account selection*/
function ShowAccountSelection() {
    $('#modalRequestAccount').modal({ backdrop: 'static', keyboard: false });
}