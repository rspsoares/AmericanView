$(document).ready(function () {
    var _multiple = false;
    var _autoUpload = true;
    var _dropFilesHere = "Arraste o arquivo para qualquer área dentro do retângulo";
    var _select = "Adicionar";
    var _saveUrl = "Carga/Upload"
    var _removeUrl = "";

    var filesObj = $("#files").kendoUpload({
        async: {
            autoUpload: _autoUpload,
            saveUrl: _saveUrl,
            removeUrl: _removeUrl
        },
        error: onError,
        multiple: _multiple,
        localization: {
            dropFilesHere: _dropFilesHere,
            select: _select
        },
        upload: function () {
            this.disable();
            $("div.k-dropzone").css("display", "none");
        },
        complete: function () {
            this.enable();
            $("div.k-dropzone").css("display", "");
        }
    }).data("kendoUpload");

});

function onError(e) {
    // Array with information about the uploaded files
    //var files = e.files;

    if (e.operation == "upload") {
        ShowModalAlerta("Erro ao realizar upload!");
    }
}

