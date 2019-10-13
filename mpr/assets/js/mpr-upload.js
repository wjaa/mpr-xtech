/**
 * TABELA DE ERROS
 * E:001 - Não foi possivel resgatar o token do servidor.
 * E:002 - Não foi possivel buscar a quantidade fotos de um produto.
 * E:003 - A busca de quantidade de fotos retornou um valor inválido. (Provalvemente o cadastro do produto está errado.)
 * E:004 - IdUpload não está configurado no produto. Veja o cadastro da xtech
 */


var token = {};
var tokenValidate = {}
var ponds = new Array();

//onload page
(function(){
    init();
})();

function init(){
    getAccessToken(callbackAccessToken);
    startEvents();
    if ( $("#idUpload").length < 1){
        seriousError("E:004 - Esse produto está indisponível no momento.")
    }
}

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
            //essa é forma se fosse utilizar direto do componente.
            //$('#gallery').slick('slickAdd','<div><h3>' + slideIndex + '</h3></div>');
            try{
                var a = $("#galleryPreview");
                var img = $("#galleryPreview img");
                a.data("image",obj.url)
                a.data("zoom-image",obj.url)
                img.attr("src",obj.url)
                a.show();
                $("#gallery").slick('slickGoTo',0,true);
                
                var zoomConfig = {cursor: "crosshair", zoomType	: "inner", easing: true, gallery: 'gallery', galleryActiveClass: 'active'};
                var zoomImage = $('#zoom')
                $(a).unbind();
                a.on('click', function(){
                    // Remove old instance od EZ
                    $('.zoomContainer').remove();
                    zoomImage.removeData('elevateZoom');
                    // Reinitialize EZ
                    zoomImage.elevateZoom(zoomConfig);
                    // Update source for images
                    setTimeout(function(){
                        zoomImage.attr('src', obj.url);
                        zoomImage.data('zoom-image', obj.url);
                        zoomImage.data('image', obj.url);
                    },200);
                }); 
                a.click();   
                //MANTER ISSO, POR CAUSA DO BUG DO ELEVATEZOON
                //elevatezoom tem um bug quando vc altera a galeria.
                setTimeout(function(){
                  a.click();
                },300)
                
                
            }catch(e){
                console.log(e);
            }
            
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

    //VERIFICANDO SE O TOKEN EXPIROU, para renovar antes do upload.
    if (tokenExpired()){
        getAccessToken(startUpload)
    }else{
        startUpload();
    }
    
}

function startUpload(){
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
            $("#idUpload").val(resultToken.token);

            //buscando o preview
            getImageMpr(resultToken.token,$("#sku").html(), function(){
                //fechando o dialog.
                $("#uploadModal").modal('toggle'); 
                //habilitando o botao de comprar novamente.
                $(".buy-btn-container").show();
                $(".alterar-fotos").show();
                $(".btn-enviar-fotos").hide();
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
            tokenValidate = {expires: token.expires_in, date: new Date()}
            console.log(tokenValidate)
            callback();
        },
        error: function(e){
            console.log(e);
            seriousError("E:001 - Esse produto está indisponível no momento.");
        }
    });
}

function seriousError(msgError){
    $(".buy-btn-container").hide();
    $(".alterar-fotos").hide();
    $(".btn-enviar-fotos").hide();
    $(".errorMessage").show();
    $(".errorMessage").html(msgError);
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
    $(".buy-btn-container").hide();
    $(".btn-enviar-fotos").show();
    $(".alterar-fotos").hide();
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
            if (obj == null || obj.qtdeFotos == null || obj.qtdeFotos < 1){
                seriousError("E:003 - Esse produto está indisponível no momento.");
            }else{
                addAmountPhoto(obj.qtdeFotos);
                startFilePond();
            }
        },
        error: function(e){
            console.log("Erro ao buscar um produto pelo sua referencia: " + ref);
            console.log(e);
            seriousError("E:002 - Esse produto está indisponível no momento.");
        }
    });
}

function addAmountPhoto(size){
    console.log("quantidade de fotos = " + size)
    var objImagesUpload =  $(".images-upload");
    objImagesUpload.html('');
    if (size == 1){
        objImagesUpload.append('<div class="col-md-offset-3 col-md-6"><input type="file" class="filepond" name="imagens" data-max-file-size="10MB" data-max-files="1"accept="image/png, image/jpeg, image/gif"></div>');
    }else if (size == 2){
        objImagesUpload.append('<div class="col-md-6"><input type="file" class="filepond" name="imagens" data-max-file-size="10MB" data-max-files="1"accept="image/png, image/jpeg, image/gif"></div>');
        objImagesUpload.append('<div class="col-md-6"><input type="file" class="filepond" name="imagens" data-max-file-size="10MB" data-max-files="1"accept="image/png, image/jpeg, image/gif"></div>');
    }else if (size > 2 && size <= 9){
        for (x = 0; x < size; x++)
        objImagesUpload.append('<div class="col-md-4"><input type="file" class="filepond" name="imagens" data-max-file-size="10MB" data-max-files="1"accept="image/png, image/jpeg, image/gif"></div>');
    }else if (size > 9){
        for (x = 0; x < size; x++)
        objImagesUpload.append('<div class="col-md-3"><input type="file" class="filepond" name="imagens" data-max-file-size="10MB" data-max-files="1"accept="image/png, image/jpeg, image/gif"></div>');
    }
}

function callbackAccessToken(){
    startDialogPhotos();
}


function tokenExpired(){
    //adicionando -120s para ter um tempo de renovar o token.
    console.log("tokenDate=" + tokenValidate.date)
    var expiresDate = new Date((tokenValidate.expires*1000) + tokenValidate.date.getTime());
    console.log("expiresDate=" + expiresDate)
    var now = new Date();
    console.log("now=" + now)
    return expiresDate.getTime() < now.getTime()
}