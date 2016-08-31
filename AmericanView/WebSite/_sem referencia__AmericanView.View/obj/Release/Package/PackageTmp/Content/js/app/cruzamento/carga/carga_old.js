$(document).ready(function () {
    //$("div.k-dropzone").css("border", "1px solid #c5c5c5");
    //$("div.k-dropzone em").css("visibility", "visible");
    //$("div.k-dropzone").css("visibility", "hidden");

    var _multiple = false;
    var _autoUpload = true;
    var _dropFilesHere = "";
    var _select = "Adicionar";
    var _saveUrl = "~/EFD/Carga/Upload"
    var _removeUrl = "";

    var filesObj = $("#files").kendoUpload({
        asyn: {
            autoUpload: _autoUpload,
            saveUrl: _saveUrl,
            removeUrl: _removeUrl
        },
        multiple: _multiple,
        localization: {
            dropFilesHere: _dropFilesHere,
            select: _select
        }
    }).data("kendoUpload");

    $(document).bind({ "dragenter": function (e) { e.preventDefault(); } });
    $(document).bind({ "dragleave": function (e) { e.preventDefault(); } });
    $(document).bind({ "dragover": function (e) { e.preventDefault(); } });
    $(document).bind({ "drop": function (e) { e.preventDefault(); } });

    var dropZone1 = $(".DropZone");
    dropZone1.bind({ "dragenter": function (e) { dragEnterHandler(e, dropZone1); } })
             .bind({ "dragleave": function (e) { dragLeaveHandler(e, dropZone1); } })
             .bind({ "drop": function (e) { dropHandler(e, dropZone1); } });

    function dropHandler(e) {
        filesObj.destroy();

        var filesToUpload = [];

        var j = 0;
        if (_multiple) {
            j = e.originalEvent.dataTransfer.files.length;
        }
        else {
            j = 1;
        }

        for (var i = 0; i < j; i++) {
            var objDroppedFiles = {};
            objDroppedFiles['name'] = e.originalEvent.dataTransfer.files[i].name
            objDroppedFiles['size'] = e.originalEvent.dataTransfer.files[i].size
            objDroppedFiles['extension'] = e.originalEvent.dataTransfer.files[i].type.split('/')[1]
            filesToUpload.push(objDroppedFiles);
        }
        filesObj = $("#files").kendoUpload({
            multiple: _multiple,
            async: {
                saveUrl: _saveUrl,
                removeUrl: _removeUrl,
                autoUpload: _autoUpload
            },
            localization: {
                dropFilesHere: _dropFilesHere,
                select: _select
            },
            files: filesToUpload
        }).data("kendoUpload");

        //$("div.k-dropzone em").html("");
    }
});