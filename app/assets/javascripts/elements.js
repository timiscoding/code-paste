var app = app || {};
app.editors = {};
app.editor_id = 0;

_.templateSettings = {
 evaluate : /\{\[([\s\S]+?)\]\}/g,     // {[ console.log("Hello"); ]} - runs
 interpolate : /\{\{([\s\S]+?)\}\}/g   // {{ key }} - interpolates
};

var createUIElement = function(an_element_id) {
  var templateArgs;
  console.log('typeof ', an_element_id);
  if (typeof an_element_id === 'number') {
    templateArgs = { element_id: an_element_id };
  } else {
    templateArgs = { element_id: '' };
  }
  console.log('create code elt with elt id ', an_element_id);
  var $codeElement = $( app.codeTemplater( templateArgs ) );
  $('body').append( $codeElement );

  // create a new editor and configure it
  var editor = CodeMirror(function (editor) {
      console.log('editor', editor);
      $codeElement.append( editor ); // add code editor to template
    }, {
      value: '// your code here',
      tabSize: 2,
      lineNumbers: true
  });
  var new_editor_id = generateEditorId();
  $codeElement.data('editor-id', new_editor_id);
  app.editors[new_editor_id] = editor;
  return $codeElement;
};

var generateEditorId = function() {
  return app.editor_id++;
}

var createUpdateElement = function () {
    var $saveButton = $( this );
    $saveButton.prop('disabled', true);
    $saveButton.siblings('.status').text('Saving...');
    //title, :page_id, :content, :link, :pos_x, :pos_y, :width, :height)
    var $codeElement = $( this ).closest('.code');
    var url = '/elements';
    var editor_id = $codeElement.data('editor-id');
    var code = {
      element: {
        title: 'new element',
        page_id: 100,
        content: app.editors[editor_id].getValue(),
        link: 'www.google.com',
        pos_x: 1,
        pos_y: 2,
        width: 500,
        height: 100
      }
    };

    var methodType, url;
    var elt_id = $codeElement.data('element-id'); // element id that identifies an element in rails
    console.log(elt_id);
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
      $codeElement.data('element-id', response.id);

      $saveButton.siblings('.status').text("Last updated: " + moment().format('h:mm:ss a') );
    }).fail(function(){
      $saveButton.siblings('.status').text("Something went wrong, try again.");
    }).always(function() {
      $saveButton.prop('disabled', false);
    });
};

var deleteElement = function() {
  console.log('delete element', this);
  var $codeElement = $( this ).closest('.code');
  var editor_id = $codeElement.data('editor-id');
  var elt_id = $codeElement.data('element-id');
  var url = '/elements/' + elt_id;
  if (elt_id){ // element id exists so destroy element in rails
    $.ajax(url, {
      method: 'delete',
      dataType: 'json'
    }).done(function() {
      console.log('element destroyed. editor_id ', editor_id);
      $codeElement.remove();
      delete app.editors[editor_id];
    }).fail(function() {
      $codeElement.find('.status').text('Something went wrong. Try again');
    });
  } else { // element doesn't exist on server so just remove the gui element
    $codeElement.remove();
    delete app.editors[editor_id];
  }
};

var changeLanguageOrTheme = function(event) {
  console.log('select changed');
  var $codeElement = $( this ).closest('.code');
  var editor_id = $codeElement.data('editor-id');
  var setting = $(this).attr('id');
  var settingVal = $(this).val();
  if ( setting === 'theme' ) {
    app.editors[editor_id].setOption('theme', settingVal );
  } else if ( setting === 'language') {
    app.editors[editor_id].setOption('mode', settingVal );
  }
};

var changeFontSize = function() {
  var $codeElement = $( this ).closest('.code');
  var editor_id = $codeElement.data('editor-id');
  var cur_size = parseInt( $codeElement.find('.CodeMirror').css('font-size') );
  if ( $(this).text() === '+' ) {
  console.log('font size inc', cur_size);
    $codeElement.find('.CodeMirror').css('font-size', (cur_size + 2) + 'px');
  } else {
    console.log('dec size');
    $codeElement.find('.CodeMirror').css('font-size', (cur_size - 2) + 'px');
  }
  app.editors[editor_id].refresh(); // update editor so cursor aligns with font resizing
};

$(document).ready(function() {
  console.log('running js');

  // get code element template
  app.codeTemplater = _.template( $('#codeTemplate').html() );
  // simulate retrieve existing element from rails
  var element_id = 36;
  if ( element_id ){
    console.log('retrieving element id ', element_id);
    var $codeElement = createUIElement(element_id);

    console.log('retrieving element');
    $.getJSON('/elements/' + element_id).done( function (data, responseStatus, jqXHR) {
      var editor_id = $codeElement.data('editor-id');
      app.editors[editor_id].setValue(data.content);
    });
  }
  // editor.setSize(500, 100);



  $('.add-code').on('click', createUIElement);

  // when user types in editor, fire event
  // CodeMirrorInstance.on('changes', function(instance, changes){
  //   console.log('editor changed', instance.getWrapperElement().parentNode);
  // });

  // when a font size button is pressed, increase/decrease font size
  $('body').on('click', '.code .font-size', changeFontSize);

  // when a theme or language is selected, update the editor
  console.log('modes', CodeMirror.modes, CodeMirror.mimeModes);
  $('body').on('change', '.code select', changeLanguageOrTheme);

  // send an AJAX POST request to create/update a new element
  $('body').on('click', '.code .save', createUpdateElement);

  $('body').on('click', '.code .delete', deleteElement);


});