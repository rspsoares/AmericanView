/*Loading basic data for user editing*/
function LoadComponentsForUserEditing() {
    $("#loading-page-edit").show();
    var user = $('#userKey').val();
    InitializeGroupKendoMultiSelect();
    LoadUserData(user);
    $("#loading-page-edit").hide();

    InitializeAccountListingGrid();
    $('#btnAccountSearchEdit').click(function () {
        $("#gridGroupAccount").toggle("slow");
        var txtBtn = $("#btnAccountSearchEdit").val();
        if (txtBtn == "Pesquisar")
            $("#btnAccountSearchEdit").val("Ocultar");
        else
            $("#btnAccountSearchEdit").val("Pesquisar");
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
    var ddlAccount = $('#selectInscrlUsrEdit').data("kendoDropDownList");
    ddlAccount.value(selectedItem.Id);

    if (HasProfileAdministrationStatus())
        ToggleUpdateActivation(true);
    else
        FillGroups(selectedItem.Id, [], true);
}

/*Disable account visibility*/
function DisableAccountVisibility() {
    var txtBtn = $("#btnAccountSearchEdit").val();
    if (txtBtn == "Ocultar") {
        $("#gridGroupAccount").toggle("slow");
        $("#btnAccountSearchEdit").val("Pesquisar");
    }
}

/*Initialize component as to prevent duplication*/
function InitializeGroupKendoMultiSelect() {
    $("#selectGroupUsrEdit").kendoMultiSelect({
        placeholder: "Escolha ...",
        dataTextField: "text",
        dataValueField: "value",
        change: function (e) {
            HandleGroupChange();
        }
    });
}

/*Load user data based on selected user*/
function LoadUserData(user) {
    $.ajax({
        url: "/Usuarios/GetEditableUser",
        type: "GET",
        async: true,
        dataType: "json",
        data: { 'uqKey': user },
        cache: true,
        success: function (result) {
            if (result.sucesso) {
                $('#userUqKey').val(result.data.UKusuario);
                FillUserBasicInfo(result.data.Nome, result.data.Login, result.data.Email, result.data.Telefone, result.data.ContaAtivada);
                FillProfile(result.data.GrupoPerfil, true);
                FillAccount(result.data.Conta, result.data.Conta == 0 ? false : true);
                
                if (result.data.GrupoEmpresasDetails != null) {
                    FillGroups(result.data.Conta, (result.data.GrupoEmpresasDetails).length > 0 ? result.data.GrupoEmpresasDetails : undefined, result.data.Conta == 0 ? false : true);
                }
                else {
                    FillGroups(result.data.Conta, undefined, false);
                }
                ToggleUpdateActivation(true);
            }
            else {
                ShowModalAlerta(result.msg);
            }
        }
    });
}

/*Fill basic info like name, login and e-mail*/
function FillUserBasicInfo(name, login, email, phone, activated) {
    $('#txtNameEdit').val(name);
    $('#txtLoginEdit').val(login);
    $('#txtEmailEdit').val(email);
    $('#txtPhoneEdit').val(phone);
    $('#selectStatusUsrEdit').prop('checked', activated);
}

/*Fill dropdownlist for profile and select its current value*/
function FillProfile(currentProfile, isToBeGenerated) {
    //basic data for empty profile
    var dataprofiles = [
        { text: "Nenhum Perfil", value: "999" }
    ];

    if (isToBeGenerated)
    {
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
                    currentProfile = 999;
                    isToBeGenerated = false;
                }
            }
        });
    }
    else {
        //force it show empty data value
        currentProfile = 999;
    }

    $('#selectProfileUsrEdit').kendoDropDownList({
        dataTextField: "text",
        dataValueField: "value",
        value: currentProfile,
        enable: isToBeGenerated,
        optionLabel: "Escolha ...",
        dataSource: dataprofiles,
        select: function (e) {//AFTER a new Profile get selected
            var dataItem = this.dataItem(e.item.index());
            HandleProfileChange(dataItem);
        }
    });
}

/*Fill dropdownlist for the account and select its current value*/
function FillAccount(currentAccount, isToBeGenerated) {
    //basic data for empty dropdownlist
    var dataaccounts = [
    { text: "Nenhuma Inscrição", value: "999" }
    ];

    if (isToBeGenerated) {        
        $.ajax({
            url: "/Usuarios/BuscarInscricoes",
            type: "GET",
            async: false,//it is necessary if we want to set sincronously
            dataType: "json",
            cache: true,
            success: function (result) {
                if (result.Sucesso) {
                    dataaccounts = result.Data;
                    $('#btnAccountSearchEdit').removeAttr('disabled');
                }
                else {
                    ShowModalAlerta(result.Data);
                    currentAccount = 999;
                }
            }
        });
    }
    else {
        //force it show empty data value
        currentAccount = 999;
    }

    $('#selectInscrlUsrEdit').kendoDropDownList({
        dataTextField: "text",
        dataValueField: "value",
        value: currentAccount,
        optionLabel: "Escolha ...",
        dataSource: dataaccounts,
        select: function (e) {//AFTER a new Account get selected
            var dataItem = this.dataItem(e.item.index());
            //dataItem.value e dataItem.text
            HandleAccountChange(dataItem);
        }
    });

    var accountdropdownList = $('#selectInscrlUsrEdit').data('kendoDropDownList');

    if (isToBeGenerated)
        accountdropdownList.enable();
    else
        accountdropdownList.enable(false);
}

/*Fill multipleselect for the account group and select its current value(s)*/
function FillGroups(currentAccount, currentGroups, isToBeGenerated) {
    //basic data for empty groups
    var datagroups = [];

    if(isToBeGenerated)
    {
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
                else
                {
                    ShowModalAlerta(result.Data);
                    isToBeGenerated = false;
                }                    
            }
        });
    }
    var selectGroupUsrEdit = $("#selectGroupUsrEdit").data("kendoMultiSelect");

    if (isToBeGenerated) {
        selectGroupUsrEdit.setDataSource(datagroups);
        selectGroupUsrEdit.enable();
        if (currentGroups != undefined)
            selectGroupUsrEdit.value(currentGroups);
    }
    else {
        selectGroupUsrEdit.value([]);
        selectGroupUsrEdit.enable(false);
    }
}

/*Check actions to be taken for selected profile*/
function HandleProfileChange(dataItem) {
    FillGroups(0,[], false);//clean selected groups
    FillAccount(0, false);//clean selected account
    $('#btnAccountSearchEdit').attr('disabled', 'disabled');
    DisableAccountVisibility();
    //Client profiles has 'Client' in its description
    if ((dataItem.text).indexOf("Cliente") > -1) {
        ToggleUpdateActivation(false);
        FillAccount(0, true);
        $('#btnAccountSearchEdit').removeAttr('disabled');
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

/*Check actions to be taken for selected account*/
function HandleAccountChange(dataItem) {
    if (dataItem.value > 0) {
        if (HasProfileAdministrationStatus())
            ToggleUpdateActivation(true);
        else
            FillGroups(dataItem.value, [], true);
    }
    else {
        FillGroups(0,[], false);
    }
}

/*Check actions to be taken for groups when changed*/
function HandleGroupChange() {
    var multiSelectGroups = $("#selectGroupUsrEdit").data("kendoMultiSelect");
    if ((multiSelectGroups.value()).length > 0)
        ToggleUpdateActivation(true);
    else
        ToggleUpdateActivation(false);
}

/*Save changed data to user*/
function UpdateUserEditing() {
    var form = $("#userFormEdit");
    form.validate();
    if (form.valid()) {
        var usuario = {
            IdUser: $('#userKey').val(),
            UQUser: $('#userUqKey').val(),
            Nome: $('#txtNameEdit').val(),
            Login: $('#txtLoginEdit').val(),
            Email: $('#txtEmailEdit').val(),
            Telefone: $('#txtPhoneEdit').val(),
            Ativo: $('#selectStatusUsrEdit').bootstrapSwitch('state'),
            Perfil: $('#selectProfileUsrEdit').data('kendoDropDownList').value(),
            Inscricao: $('#selectInscrlUsrEdit').data('kendoDropDownList').value(),
            Grupos: $('#selectGroupUsrEdit').data('kendoMultiSelect').value()
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
                    $('#editarUsuarioModal').modal('hide');
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

/*Request removal for non-verified user*/
function RemoveNonVerifiedUser() {

}

/*Analyze profile for administrator stats*/
function HasProfileAdministrationStatus() {
    var analisysResult = undefined;
    var profiledropdownlist = $('#selectProfileUsrEdit').data('kendoDropDownList');
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

/*Enable or Disable Save button*/
function ToggleUpdateActivation(isToActivate) {
    if (isToActivate)
        $('#btnUpdateEdit').removeAttr('disabled');
    else
        $('#btnUpdateEdit').attr('disabled', 'disabled');
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