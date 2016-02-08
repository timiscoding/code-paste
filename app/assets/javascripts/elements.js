var app = app || {};

_.templateSettings = {
 evaluate : /\{\[([\s\S]+?)\]\}/g,     // {[ console.log("Hello"); ]} - runs
 interpolate : /\{\{([\s\S]+?)\}\}/g   // {{ key }} - interpolates
};

var createUpdateElement = function (e) {
    e.preventDefault();
    var $saveButton = $( this );
    $saveButton.prop('disabled', true);
    $saveButton.siblings('.status').text('Saving...');
    //title, :page_id, :content, :link, :pos_x, :pos_y, :width, :height)
    var $codeElement = $( this ).closest('.code');
    var url = '/elements';
    var code = {
      element: {
        title: 'new element',
        page_id: 100,
        content: app.editor.getValue(),
        link: 'www.google.com',
        pos_x: 1,
        pos_y: 2,
        width: 500,
        height: 100
      }
    };

    var methodType, url;
    var elt_id = $('.code').data('id'); // element id that identifies an element in rails
    if ( elt_id ) { // element id exists so update an existing element in rails
      methodType = 'put';
      url = '/elements/' + elt_id;
    } else { // element id doesn't exist so create a new element in rails
      methodType = 'post';
      url = '/elements';
    }

    $.ajax(url, {
      method: methodType,
      dataType: 'json',
      data: code
    }).done(function( response ){
      console.log('saved. codeElement', $codeElement, response.id);
      $codeElement.data('id', response.id);

      $saveButton.siblings('.status').text("Last updated: " + moment().format('h:mm:ss a') );
    }).fail(function(){
      $saveButton.siblings('.status').text("Something went wrong, try again.");
    }).always(function() {
      $saveButton.prop('disabled', false);
    });
};

var changeLanguageOrTheme = function(event) {
  console.log('select changed');
  var setting = $(this).attr('id');
  var settingVal = $(this).val();
  if ( setting === 'theme' ) {
    app.editor.setOption('theme', settingVal );
  } else if ( setting === 'language') {
    app.editor.setOption('mode', settingVal );
  }
};

var changeFontSize = function(e) {
  e.preventDefault();
  var cur_size = parseInt( $('.CodeMirror').css('font-size') );
  if ( $(this).text() === '+' ) {
  console.log('font size inc', cur_size);
    $('.CodeMirror').css('font-size', (cur_size + 2) + 'px');
  } else {
    console.log('dec size');
    $('.CodeMirror').css('font-size', (cur_size - 2) + 'px');
  }
};

$(document).ready(function() {
  console.log('running js');
  // get code element template
  var codeTemplater = _.template( $('#codeTemplate').html() );
  var $codeElement = $( codeTemplater() );
  // simulate retrieve existing element from rails
  var element_id = 42;
  if ( element_id ){
    console.log('retrieving element');
    $.getJSON('/elements/' + element_id).done( function (data, responseStatus, jqXHR) {
      app.editor.setValue(data.content);
      $codeElement.data('id', element_id);
    });
  }
  // editor.setSize(500, 100);
  $('body').append( $codeElement );

  // create a new editor and configure it
  app.editor = CodeMirror(function (editor) {
      console.log('editor', editor);
      $codeElement.append( editor ); // add code editor to template
    }, {
      value: '// your code here',
      tabSize: 2,
      lineNumbers: true
  });




  // when user types in editor, fire event
  app.editor.on('changes', function(instance, changes){
    console.log('editor changed', instance.getWrapperElement().parentNode);
  });

  // when a font size button is pressed, increase/decrease font size
  $('.font-size').on('click', changeFontSize);

  // when a theme or language is selected, update the editor
  console.log('modes', CodeMirror.modes, CodeMirror.mimeModes);
  $('.code').on('change', 'select', changeLanguageOrTheme);

  // send an AJAX POST request to create/update a new element
  $('.code .save').on('click', createUpdateElement);


});