var token = {};
var ponds = new Array();

//onload page
(function(){
    init();
})();


/**
 * Busca a imagem de preview na api do MPR.
 * @param {*} uploadToken 
 * @param {*} referencia 
 * @param {*} callback 
 */
function getImageMpr(uploadToken,referencia, callback){
    $.ajax({
        type: "GET",
        url: mprUrl + "/api/v1/core/preview/" + uploadToken + "/" + referencia,
        dataType: 'json',
        headers: {
            "Authorization" : "Bearer " + token.access_token
        },
        success: function (obj){
            $(".prod-image > img").attr("src", obj.url);
            callback();
        },
        error: function(e){
            console.log("Erro ao buscar o preview com uploadToken");
            callback();
        }
    });
}

/**
 * Envia os arquivos para a api do MPR e recebe um token para gerar o preview.
 */
function upload(){
    var fileInput = document.getElementsByClassName('filepond--browser');
    var formData = new FormData();
    ponds.forEach(function(pond,index){
        var file = pond.getFile().file;//fileInput[0].files[0];
        formData.append('imagens', file);   
    });
    
    $.ajax({
        //barra de progresso do upload.
        xhr: function () {
            $('.progress').removeClass('hide');
            if (ponds.length > 1){
                $('#wait-text').text("Aguarde! Enviado suas fotos...")
            }else{
                $('#wait-text').text("Aguarde! Enviado sua foto...")
            }
            $('.wait-preview').removeClass('hide');
            
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress", function (evt) {
                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total;
                    var percent = parseInt(percentComplete * 100);
                    console.log("upload = " + percentComplete);
                    $('.progress-bar')
                    .css('width', percent+'%')
                    .attr('aria-valuenow', percent)
                    .html(percent+'%');
                    if (percentComplete === 1) {
                        $('.progress').addClass('hide');
                        $('#wait-text').text("Aguarde! Estamos gerando uma pré visualização do seu Porta-Retrato...")
                    }
                }
            }, false);
            return xhr;
        },
        type: "POST",
        url: mprUrl + "/api/v1/core/upload",
        dataType: 'json',
        headers: {
            "Authorization" : "Bearer " + token.access_token
        },
        data: formData,
        processData: false,  // tell jQuery not to process the data
        contentType: false, 
        success: function (resultToken){
            //XTECH25
            //buscando o preview
            getImageMpr(resultToken.token,$("#sku").html(), function(){
                //fechando o dialog.
                $("#uploadModal").modal('toggle'); 
                //habilitando o botao de comprar novamente.
                $("#buy-btn").attr("disabled",false);
                initStateDialog();
            });
            

        },
        error: function (e){
            console.log(e);
            initStateDialog();
        }
    });
}

/**
 * Coloca o dialog em estagio inicial.
 */
function initStateDialog(){
    //escondendo o waiting.
    $('.wait-preview').addClass('hide');
    //habilitando os botoes do dialog
    $(".btn-dialog").attr("disabled",false);

    //escondendo o progress bar e zerando ele.
    $('.progress').addClass('hide');
    $('.progress-bar')
        .css('width', '0%')
        .attr('aria-valuenow', 0)
        .html('0%');
}

/**
 * Pega um AccessToken na API do MPR.
 */
function getAccessToken(callback){
    $.ajax({
        type: "POST",
        url: mprUrl + "/oauth/token",
        dataType: 'json',
        headers: {
            "Authorization": "Basic " + btoa(mprUser + ":" + mprPass)
        },
        data: 'grant_type=client_credentials',
        success: function (resultToken){
            token = resultToken;
            callback();
        }
    });
}

/**
 * Inicia o FilePond, lib responsavel pelo layout do upload.
 */
function startFilePond(){
    FilePond.registerPlugin(
        FilePondPluginFileValidateSize,
        FilePondPluginFileValidateType,
        FilePondPluginImageExifOrientation,
        FilePondPluginImagePreview,
        FilePondPluginImageTransform,
    );

    // Select the file input and use 
    // create() to turn it into a pond
    $( "input[type='file']").each(function(i){
            ponds.push(FilePond.create(
            this,
            {
            labelIdle: `Arraste e solte sua imagem ou <span class="filepond--label-action">Abra aqui</span>`,
            allowImagePreview: true,
            imagePreviewHeight: 150,
            imageCropAspectRatio: '1:1',
            imageResizeTargetWidth: 150,
            imageResizeTargetHeight: 150,
            stylePanelLayout: 'compact circle',
            styleLoadIndicatorPosition: 'center bottom',
            styleProgressIndicatorPosition: 'right bottom',
            styleButtonRemoveItemPosition: 'left bottom',
            styleButtonProcessItemPosition: 'right bottom',
            }
        ));
    });
}

function startEvents(){
    $("#buy-btn").attr("disabled",true);
    $("#btnUpload").click(function(){
        console.log(token.access_token);
        console.log("iniciando upload");
        //desabilitar os botoes do dialog
        $(".btn-dialog").attr("disabled",true);

        upload();
        
    });
}
/**
 * Buscando o produto na API do MPR para verificar quantas fotos ele tem.
 */
function startDialogPhotos(){
    var ref = $("#sku").html();

    
    $.ajax({
        type: "GET",
        url: mprUrl + "/api/v1/core/produto/byRef/" + ref,
        dataType: 'json',
        headers: {
            "Authorization" : "Bearer " + token.access_token
        },
        success: function (obj){
            addAmountPhoto(obj.qtdeFotos);
            startFilePond();
        },
        error: function(e){
            console.log("Erro ao buscar um produto pelo sua referencia: " + ref);
            
        }
    });
}

function addAmountPhoto(size){
    console.log("quantidade de fotos = " + size)
    var objImagesUpload =  $(".images-upload");
    objImagesUpload.html('');
    if (size == 1){
        objImagesUpload.append('<div class="col-md-offset-3 col-md-6"><input type="file" class="filepond" name="imagens" data-max-file-size="3MB" data-max-files="3"accept="image/png, image/jpeg, image/gif"></div>');
    }else if (size == 2){
        objImagesUpload.append('<div class="col-md-6"><input type="file" class="filepond" name="imagens" data-max-file-size="3MB" data-max-files="3"accept="image/png, image/jpeg, image/gif"></div>');
        objImagesUpload.append('<div class="col-md-6"><input type="file" class="filepond" name="imagens" data-max-file-size="3MB" data-max-files="3"accept="image/png, image/jpeg, image/gif"></div>');
    }else if (size > 2 && size <= 9){
        for (x = 0; x < size; x++)
        objImagesUpload.append('<div class="col-md-4"><input type="file" class="filepond" name="imagens" data-max-file-size="3MB" data-max-files="3"accept="image/png, image/jpeg, image/gif"></div>');
    }else if (size > 9){
        for (x = 0; x < size; x++)
        objImagesUpload.append('<div class="col-md-3"><input type="file" class="filepond" name="imagens" data-max-file-size="3MB" data-max-files="3"accept="image/png, image/jpeg, image/gif"></div>');
    }
}

function callbackAccessToken(){
    startDialogPhotos();
}
function init(){
    getAccessToken(callbackAccessToken);
    startEvents();
    
}


