function CarregaComponentes() {
    document.getElementById("labelCNPJ").parentElement.hidden = true;
    document.getElementById("selectCNPJ").parentElement.hidden = true;

    LoadDsGrid();

    var txtNumDevNota = document.getElementById("txtNumDevNota"); txtNumDevNota.disabled = true;
    var txtNumDevProduto = document.getElementById("txtNumDevProduto"); txtNumDevProduto.disabled = true;
    var txtHigienizacao = document.getElementById("txtHigienizacao"); txtHigienizacao.disabled = true;
    var txtLimpezaLog = document.getElementById("txtLimpezaLog"); txtLimpezaLog.disabled = true;
}

function LoadDsGrid() {
    $.ajax({
        url: "/Config/ObterParametrizacoes",
        type: "GET",
        async: false,
        cache: false,
        dataType: "json",
        success: function (result) {
            try{
                $('#txtNumDevNota').val(parseInt(result.quantidadeNotaFiscalPagina));
                $('#txtNumDevProduto').val(parseInt(result.quantidadeProdutoPagina));
                $('#txtHigienizacao').val(parseInt(result.diasHigienizacao));
                $('#txtLimpezaLog').val(parseInt(result.diasLimpezaLog));
            }
            catch (e) {
                ShowModalAlerta(result + "!");
            }
        }
    });
}

function SalvarConfigs() {
    var newParam = [];
    newParam.push({
        quantidadeNotaFiscalPagina: parseInt($('#txtNumDevNota').val()),
        quantidadeProdutoPagina: parseInt($('#txtNumDevProduto').val()),
        diasHigienizacao: parseInt($('#txtHigienizacao').val()),
        diasLimpezaLog: parseInt($('#txtLimpezaLog').val())
    });
    

    $.ajax({
        url: "/Config/SalvarParametrizacoes",
        data: JSON.stringify(newParam[0]),
        type: 'POST',
        async: true,
        contentType: 'application/json; charset=utf-8',
        success: function (result) {
            if (result != "") {
                ShowModalAlerta(result + "!");
            }
            else {
                ShowModalSucesso("Alterações efetuadas com Sucesso!");
                LoadDsGrid();
                BloquearCampos(true);
                $('#btnVoltar').hide();
                $('#btnSalvar').hide();
                $('#btEditar').show();
            }
        }
    });
}

function EditarConfiguracoes()
{
    BloquearCampos(false);       
}

function BloquearCampos(lock)
{
    var txtNumDevNota = document.getElementById("txtNumDevNota"); txtNumDevNota.disabled = lock;
    var txtNumDevNotaKendo = $("#txtNumDevNota").data("kendoNumericTextBox"); txtNumDevNotaKendo.enable(!lock);

    var txtNumDevProduto = document.getElementById("txtNumDevProduto"); txtNumDevProduto.disabled = lock;
    var txtNumDevProdutoKendo = $("#txtNumDevProduto").data("kendoNumericTextBox"); txtNumDevProdutoKendo.enable(!lock);

    var txtHigienizacao = document.getElementById("txtHigienizacao"); txtHigienizacao.disabled = lock;
    var txtHigienizacaoKendo = $("#txtHigienizacao").data("kendoNumericTextBox"); txtHigienizacaoKendo.enable(!lock);

    var txtLimpezaLog = document.getElementById("txtLimpezaLog"); txtLimpezaLog.disabled = lock;
    var txtLimpezaLogKendo = $("#txtLimpezaLog").data("kendoNumericTextBox"); txtLimpezaLogKendo.enable(!lock);

    if(lock)
    {
        $('#btnVoltar').hide();
        $('#btnSalvar').hide();
        $('#btEditar').show();        
    }
    else
    {
        $('#btnVoltar').show();
        $('#btnSalvar').show();
        $('#btEditar').hide();        
    }
}

function Voltar()
{
    BloquearCampos(true);   
}

