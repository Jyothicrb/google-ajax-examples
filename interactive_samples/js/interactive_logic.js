// Anonymous function, keep the global namespace squeeky clean..
(function() {

  // TODO:
  // Make it so that you can make the code editing window wider...
  // Make it so that you can click links to the documentation of each object

  // TODO: make css rules for minimizing stuff easily

  if (typeof console == 'undefined') {
    var console = {
      log : function() {}
    };
  }

  var fileTypes = {
    'js' : 'javascript',
    'html' : 'html',
    'php' : 'php'
  };

  function _cel(name) {
    return document.createElement(name);
  }




  function InteractiveSample(){
    this.categories = [];
    this.subCategories = [];
    this.codeTitles = [];
    this.selectCode = null;
    this.codeDiv = null;
    this.codeLIs = [];
    this.currentCode = new Object();
    this.curI = '';
    this.htmlEditor;

    this.uiEffects = new Object();
    this.runBox = new Object();
    this.autoCompleteData = [];
  };

  InteractiveSample.prototype.nameToHashName = function(name) {
    var hashName = name.toLowerCase();
    hashName = hashName.replace(/ /g, '_');
    return hashName;
  };

  InteractiveSample.prototype.init = function(codeDiv) {
    this.ie6 = ($.browser.msie && $.browser.version < 7);
    this.runBox = new RunBox();
    this.runBox.init(this, !this.ie6);
    this.codeDiv = codeDiv;
    this.createCategories();
    this.addShowHideClicks();
    this.uiEffects = new UIEffects();
    this.uiEffects.init(this);
  };

  InteractiveSample.prototype.deleteCustomExample = function(id) {
    return function() {
      var confirmDelete = confirm('Are you sure you want to delete this example?');
      if (confirmDelete) {
        var redirect = '/delete?id=' + id;
        redirect += ((curAPITypes) ? '&type=' + curAPITypes : '');
        window.location = redirect;

      }
    };
  };

  InteractiveSample.prototype.addDeleteIcon = function(li, id) {
//    var imgTD = _cel('td');
    var deleteCodeImg = _cel('img');
    deleteCodeImg.src = 'images/trash.gif';
    deleteCodeImg.style.cursor = 'pointer';
    deleteCodeImg.style.marginLeft = '6px';
    $(deleteCodeImg).bind('click', this.deleteCustomExample(id));

    li.appendChild(deleteCodeImg);
  };

  InteractiveSample.prototype.createCategories = function() {
    // codeArray is from ajax_apis_samples.js
    this.selectCode = $('#selectCode').get(0);
    for (var i=0; i < codeArray.length; i++) {
      var category = codeArray[i].category;
      var container = null;
      var subCategory = null;
      var categoryDiv = null;
      var subCategoryDiv = null;
      var img, link;
      if (category.indexOf('-') != -1) {
        // that means that this category is a subcategory
        var categorySplit = category.split('-');
        category = categorySplit[0];
        subCategory = categorySplit[1];
      }
      categoryDiv = document.getElementById(category);
      if (categoryDiv == null) {
        categoryDiv = _cel('span');
        categoryDiv.className = 'category categoryClosed';
        categoryDiv.id = category;
        var catName = _cel('span');
        catName.className = 'categoryTitle';
        img = _cel('img');
        img.className = 'expand';
        img.src = 'images/cleardot.gif';

        catName.appendChild(img);
        catName.innerHTML += category;
        if (codeArray[i].docsUrl) {
          link = this.createDocsLink(codeArray[i].docsUrl);
          catName.appendChild(link);
        }
        categoryDiv.appendChild(catName);
        this.selectCode.appendChild(categoryDiv);

        this.categories.push(categoryDiv);
      }

      if (subCategory) {
        subCategoryDiv = document.createElement('div');
        var subCatName = _cel('span');
        subCatName.className = 'subCategoryTitle';

        img = _cel('img');
        img.className = 'collapse';
        img.src = 'images/cleardot.gif';

        subCatName.appendChild(img);
        subCatName.innerHTML += subCategory;

        subCategoryDiv.appendChild(subCatName);

        if (codeArray[i].docsUrl) {
          link = this.createDocsLink(codeArray[i].docsUrl);
          subCategoryDiv.appendChild(link);
        }

        categoryDiv.appendChild(subCategoryDiv);
      }

      container = subCategoryDiv || categoryDiv;

      var ul = _cel('ul');
      ul.className = 'categoryItems';

      container.appendChild(ul);

      for (var j=0; j < codeArray[i].samples.length; j++) {
        var item = codeArray[i].samples[j];
        var li = _cel('li');
        var textNode = document.createElement('span');
        textNode.innerHTML = item.sampleName;
        textNode.style.cursor = 'pointer';
        $(textNode).bind('click', this.showSample(this, item.sampleName));
        li.appendChild(textNode);
        if (item.docsUrl) {
          li.appendChild(this.createDocsLink(item.docsUrl));
        }
        if (category == 'Saved Code') {
          this.addDeleteIcon(li, codeArray[i].samples[j].id);
        }
        var tags = ' <sup>(' + ((category) || '') + ((subCategory) ? ', ' + subCategory : '');
        tags += (item.tags) ? ', ' + item.tags : '';
        tags += ')<\/sup>';
        this.autoCompleteData.push(item.sampleName + tags);
        codeArray[i].samples[j]['li'] = li;

        if (i == 0 && j == 0) {
          this.showSample(this, item.sampleName, true)();
          this.hideAllCategoriesExcept(categoryDiv);
        }

        if (window.location.hash.length > 0) {
          var hashName = this.nameToHashName(item.sampleName);
          if (window.location.hash.substring(1) == hashName) {
            this.showSample(this, item.sampleName)();
            this.hideAllCategoriesExcept(categoryDiv);
          }
        }

        this.codeLIs.push(li);
        ul.appendChild(li);
      }

      if (container != categoryDiv) {
        this.subCategories.push(container);
      }
    }
  };

  InteractiveSample.prototype.createDocsLink = function(docUrl) {
    if (docUrl) {
      var img = _cel('img');
      img.src = 'images/docs.gif';
      img.className = 'docsImg';
      img.border = 0;

      var link = _cel('a');
      link.href = docUrl;
      link.target = "_blank";
      link.className = "docsLink";
      link.appendChild(img);
      link.style.display = 'inline';

      return link;
    }
  };

  InteractiveSample.prototype.toggleShowHideLIs = function(category) {
    return function() {
      var ul = category.nextSibling;
      // if the sibling is an anchor, that means it's the docsLink anchor, so grab the one after.
      if (ul.nodeName.toLowerCase() == 'a') ul = ul.nextSibling;
      var el = category.childNodes[0];
      if (el.className == 'expand')
        el.className = 'collapse';
      else
        el.className = 'expand';

      if (ul.style.display == 'none') {
        ul.style.display = 'block';
      } else {
        ul.style.display = 'none';
      }
    };
  };

  InteractiveSample.prototype.toggleShowHideSubCategories = function(category) {
    return function() {
      // Change the collapse img to a + or a -
      var collapseImg = category.childNodes[0].childNodes[0];
      if (collapseImg.className == 'expand') {
        collapseImg.className = 'collapse';
        category.className = 'category categoryOpen';
      } else {
        collapseImg.className = 'expand';
        category.className = 'category categoryClosed';
      }
    };
  };

  InteractiveSample.prototype.hideAllCategoriesExcept = function(category) {
    for (var i=0; i < this.categories.length; i++) {
      var curCategory = this.categories[i];
      var collapseImg = curCategory.childNodes[0].childNodes[0];
      if (curCategory != category) {
        curCategory.className = 'category categoryClosed';
        collapseImg.className = 'expand';
      } else {
        curCategory.className = 'category categoryOpen';
        collapseImg.className = 'collapse';
      }
    };
  };

  InteractiveSample.prototype.addShowHideClicks = function() {
    var i;
    for (i = 0; i < this.categories.length; i++) {
      var cat = this.categories[i];
      var catTitle = cat.childNodes[0];
      $(catTitle).bind('click', this.toggleShowHideSubCategories(cat));
    }

    for (i = 0; i < this.subCategories.length; i++) {
      var subCatTitle = this.subCategories[i].childNodes[0];
      $(subCatTitle).bind('click', this.toggleShowHideLIs(subCatTitle));
    };
  };

  InteractiveSample.prototype.loadRemotely = function(filename, fileType, opt_changeCodeMirror) {
    var is_instance = this;
    $.get(filename, function(data) {
      if (opt_changeCodeMirror) {
        is_instance.changeCodeMirror(data);
      }
      is_instance.currentCode[filename] = {
        code : data
      };
      is_instance.runCode();
    });
  };

  InteractiveSample.prototype.loadCode = function(filename, opt_changeCodeMirror) {
    // If the code is in the currentCode buffer, then grab it there
    // otherwise, load it via XHR
    // If opt_changeCodeMirror is specified, load it into the window

    // Get filetype
    var filenameSplit = filename.split('.');
    var extension = filenameSplit[filenameSplit.length - 1];
    var fileType = fileTypes[extension.toLowerCase()];
    var inBuffer = (this.currentCode[filename] && this.currentCode[filename].code);
    if (inBuffer && opt_changeCodeMirror) {
      this.changeCodeMirror(this.currentCode[filename].code);
    } else {
      this.loadRemotely(filename, fileType, opt_changeCodeMirror);
    }
  };

  InteractiveSample.prototype.sampleNameToObject = function(sampleName) {
    for (var i=0; i < codeArray.length; i++) {
      for (var j=0; j < codeArray[i].samples.length; j++) {
        var sampleObj = codeArray[i].samples[j];
        if (sampleObj.sampleName == sampleName) {
          sampleObj['category'] = codeArray[i].category;
          sampleObj['categoryDocsUrl'] = codeArray[i].docsUrl || null;
          return sampleObj;
        }
      }
    }
  };

  InteractiveSample.prototype.sampleFileNameToObject = function(sampleFileName) {
    for (var i=0; i < codeArray.length; i++) {
      for (var j=0; j < codeArray[i].samples.length; j++) {
        var sampleObj = codeArray[i].samples[j];
        for (var k=0; k < sampleObj.files.length; k++) {
          var file = sampleObj.files[k];
          if (sampleFileName == file) {
            sampleObj['category'] = codeArray[i].category;
            sampleObj['categoryDocsUrl'] = codeArray[i].docsUrl || null;
            return sampleObj;
          }
        }
      }
    }
  };

// TODO: can is_instance just be set as is_instance = this above return function()
  InteractiveSample.prototype.showSample = function(is_instance, sampleName, def) {
    return function() {
      var sampleObj = is_instance.sampleNameToObject(sampleName);
      var files = sampleObj.files;
      var thisLI = sampleObj.li;
      var catSplit = sampleObj.category.split('-');
      var categoryName = catSplit[0];

      var codeLIs = is_instance.codeLIs;
      var title = $('<div>' + (catSplit[1] ? catSplit[1] : catSplit[0]) + ' > ' + sampleName + '</div>');
      if (sampleObj.docsUrl) {
//        var docLink = $('<sup></sup>').append(is_instance.createDocsLink(sampleObj.docsUrl));
        var docLink = $('<sup style="font-size:13px;"> (<a href="' +
                        sampleObj.docsUrl +
                        '" target="_blank">docs</a>)</sup>');
        title.append(docLink);
      } else if (sampleObj.categoryDocsUrl) {
        var docLink = $('<sup style="font-size:13px;"> (<a href="' +
                        sampleObj.categoryDocsUrl +
                        '" target="_blank">docs</a>)</sup>');
        title.append(docLink);
      }
      is_instance.setDemoTitle(title.get(0));
      var i;
      for (i = 0; i < codeLIs.length; i++) {
        codeLIs[i].className = '';
      }

      // For linking purposes
      if (!def) {
        window.location.hash = is_instance.nameToHashName(sampleName);
      }

      // Make code selected designate this as selected
      thisLI.className = 'selected';

      is_instance.currentCode = new Object();


      // add file names at top
      // var tab_bar = $('#tab_bar');
      // tab_bar.innerHTML = '';

      for (i = 0; i < files.length; i++) {
        var file = files[i];

        var tabClass = 'lb';
        if (i == 0) {
          tabClass = 'db';
          is_instance.loadCode(file, true);
        } else {
          is_instance.loadCode(file, false);
        }


        var containerDiv = _cel('div');
        containerDiv.className = 'roundedcornr_box';
        $(containerDiv).bind('click', is_instance.changeTab(file, is_instance));

        var html = '<div class="' + tabClass + '_top" ><div><\/div><\/div>';
        html += '<div class="' + tabClass + '_roundedcornr_content" >';
        html += file;
        html += '<\/div>';

        containerDiv.innerHTML = html;

      // tab_bar.appendChild(containerDiv);
      }

    // is_instance.loadCode(files[0], textArea);
      is_instance.hideAllCategoriesExcept(document.getElementById(categoryName));
      is_instance.curI = files[0];
    };
  };

  InteractiveSample.prototype.changeTab = function(i, is_instance) {
    return function() {
      var siblings = this.parentNode.childNodes;
      is_instance.currentCode[is_instance.curI].code = is_instance.getCode();

    // Swap the colors of the tabs
      for (var z=0; z < siblings.length; z++) {
        if (siblings[z].childNodes[1].innerHTML == i) {
          siblings[z].childNodes[0].className = 'db_top';
          siblings[z].childNodes[1].className = 'db_roundedcornr_content';
        } else {
          siblings[z].childNodes[0].className = 'lb_top';
          siblings[z].childNodes[1].className = 'lb_roundedcornr_content';
        }
      }

      is_instance.loadCode(i, true);
      is_instance.curI = i;
    };
  };

  InteractiveSample.prototype.runCode = function() {
    try {
      if (typeof this.currentCode[this.curI] == 'undefined') {
        this.currentCode[this.curI] = new Object();
      }
      this.codeToRun = this.currentCode[this.curI].code = this.getCode();
      this.runBox.runCode();
    } catch (e) {
      // this will fail sometimes and that's OK.  It just means that CodeMirror
      // doesn't have the code loaded that we are trying to use.
    }
  };

  InteractiveSample.prototype.changeCodeMirror = function(content) {
    try {
      window.jsEditor.setCode(content);
    } catch (e) {
      alert('fail!');
    }
  };

  InteractiveSample.prototype.getCode = function() {
    return window.jsEditor.getCode();
  };

  InteractiveSample.prototype.getCurFilename = function() {
    return this.curI;
  };

  InteractiveSample.prototype.getFullSrc = function(callbackFunc) {
    var curFilename = this.getCurFilename();
    var sampleObj = this.sampleFileNameToObject(curFilename);
    var url = sampleObj.boilerplateLoc;
    var is_instance = this;
    $.get(url, function(data, success) {
      if (success) {
        var code = is_instance.getCode();
        code = '    '.concat(code);
        var newLine = code.indexOf('\n');
        while (newLine != -1) {
          var start = code.slice(0, newLine);
          var end = code.slice(newLine+1);
          end = '\n    '.concat(end);
          code = start.concat(end);
          newLine = code.indexOf('\n', newLine + 1);
        }
        /* TODO: fix this hack.  there's gotta be a better way than
         doing a find for the place where the code goes and replacing it */
        data = data.replace(
                '    try {\n' +
                '      if (window.parent && window.parent.is && window.parent.is.codeToRun) window.eval(window.parent.is.codeToRun);\n' +
                '    } catch (e) {\n' +
                '      alert("Error: " + e.message);\n' +
                '    }', code);
        callbackFunc(data);
      }
    });
  };

  InteractiveSample.prototype.outputSource = function() {
    this.getFullSrc(this.uiEffects.showSource);
  };

  InteractiveSample.prototype.setDemoTitle = function(title) {
    $('#demoTitle').html(title);
  };

  InteractiveSample.prototype.sendCodeToServer = function(code) {
    code = code.replace(/\n/g, 'NEWLINE!!!');
    $('#codeHolder').attr('value', code);

    $('#linkCodeForm').get(0).submit();
  };

  InteractiveSample.prototype.linkCode = function() {
    this.getFullSrc(this.sendCodeToServer);
  };

  InteractiveSample.prototype.saveCode = function() {
    var curFilename = this.getCurFilename();
    var sampleObj = this.sampleFileNameToObject(curFilename);
    if (sampleObj.category == 'Saved Code') {
      var confirmOverwrite = confirm('Are you sure you want to overwrite this code?');
      if (confirmOverwrite) {

        // HUGE HACK.  In IE, an input element can't store a newline character,
        // or at least I can't find out how.  So they all get lost during the send
        // so on the server side i will parse out NEWLINE!!! and add in the correct
        // code :)
        var code = this.getCode();
        code = code.replace(/\n/g, 'NEWLINE!!!');
        $('#jscodeSaveForm').attr('value', code);
        // $('#saveSampleName').attr('value', sampleObj.sampleName);
        $('#idSaveForm').attr('value', sampleObj.id);
        // $('#tagsSaveForm').attr('value', sampleObj.tags);
        $('#saveForm').submit();
      }
    } else {
     this.uiEffects.showSaveForm();
    }
  };

  InteractiveSample.prototype.confirmLogin = function(url, opt_mustLogin) {
    var confirmLeave;
    if (opt_mustLogin) {
      confirmLeave = confirm('You must login to save.  Logging in will lose any edited code.');
    } else {
      confirmLeave = confirm('Logging in will lose any edited code.');
    }

    if (confirmLeave) window.location = url;
  };




  /*
   * UIEffects sets up all of the jQuery UI stuff for draggable etc.
  */
  function UIEffects() {
    this.is = new Object();
    this.mousePos = new Object();
    this.numHTMLEditors;
  }

  UIEffects.prototype.init = function(is) {
    this.is = is;
    this.numHTMLEditors = 0;

    this.mousePos = {
      'x': 0,
      'y': 0
    };

    var me = this;
  // So that we can track the mouse movement
    $().mousemove(function(e){
      me.mousePos.x = e.pageX;
      me.mousePos.y = e.pageY;
    });

    if (!this.is.ie6) {
      this.setOutputDivResizable();
      this.setOutputDivDraggable();
      this.setDivShadow('outputDiv', 'runShadowContainer');
      this.setWindowResize();
    } else {
      $('#outputDrag').css('cursor', 'default');
    }
    // IE has an extremely extremely weird bug with populating the editing window.
    // For now I can't fix it.  maybe later add autocomplete for IE.
    // TODO: Fix autocomplete for IE (HARD BUG)
    this.initAutoComplete();

    if ($.browser.safari) $('.buttonText').css('padding-bottom', '5px');
    this.initShowSourceDiv();
    this.initSaveCodeDiv();
    this.setCodeMenuButtonClicks();
  };
  
  UIEffects.prototype.setCodeMenuButtonClicks = function() {
    var me = this;
    
    $('#codeMenuButtonContainer').bind('click', function() {
      me.toggleDropdown('codeMenuDropdown');
      return false;
    });
    
    
    $(window).bind('click', function() {
      me.toggleDropdown('codeMenuDropdown', true);
      return false;
    });
    
  }

  UIEffects.prototype.setDivShadow = function(divName, shadowDivName) {
    var outputContainer = $("#" + divName);
    var outputContainerWidth = $(outputContainer).width();
    var outputContainerHeight = $(outputContainer).height();
    var outputContainerPos = $(outputContainer).position();

    this.setShadowDivSize(shadowDivName, outputContainerWidth, outputContainerHeight);
    this.setShadowDivPosition(shadowDivName, outputContainerPos.top, outputContainerPos.left);
    this.showShadowDiv(shadowDivName);
  };

  UIEffects.prototype.setWindowResize = function() {
    var me = this;
    $(window).bind('resize', function() {
      me.setDivShadow('outputDiv', 'runShadowContainer');
    });
  };

  UIEffects.prototype.setOutputDivResizable = function() {
    var me = this;
    var width = $("#outputDiv").width();
    var height = $("#outputDiv").height();
    $("#outputDiv").css('position', 'absolute').css('width', width).css('height', height);
    $("#outputDiv").resizable({
      handles: "se",
      helper: 'proxy',
      resize: function(e, ui) {
        me.updateDragSafeDiv();
      },
      minHeight: 115,
      minWidth: 115,
      stop: function(e, ui) {
        me.hideDragSafeDiv();
        me.setShadowDivSize('runShadowContainer', ui.size.width, ui.size.height);
        me.is.runBox.setNewCodeRunIframeWidthHeight($('#runFrame'));
      }
    });
  };

  UIEffects.prototype.setOutputDivDraggable = function() {
    var me = this;
    $("#outputDiv").draggable({
      handle: "outputDrag",
      drag: function(e, ui) {
        me.updateDragSafeDiv();
        me.setShadowDivPosition('runShadowContainer', ui.position.top, ui.position.left);
      },
      stop: function(e, ui) {
        me.hideDragSafeDiv();
      }
    });
  };

  UIEffects.prototype.updateDragSafeDiv = function() {
    var newTop = this.mousePos.y - 300;
    var newLeft = this.mousePos.x - 300;
    $('#dragsafe').css('top', newTop + 'px').css('left', newLeft + 'px');
  };

  UIEffects.prototype.hideDragSafeDiv = function() {
    $('#dragsafe').css('top', '-600px').css('left', '-600px');
  };

  UIEffects.prototype.showShadowDiv = function(containerName) {
    $('#' + containerName).show();
  };

  UIEffects.prototype.setShadowDivPosition = function(containerName, top, left) {
    containerName = '#' + containerName;
    var shadowContainer = $(containerName);
    $(shadowContainer).css('top', top + 'px').css('left', left + 'px');
  };

  UIEffects.prototype.setShadowDivSize = function(containerName, newWidth, newHeight) {
    containerName = '#' + containerName;
    var shadowContainer = $(containerName);
    var oldWidth = $(shadowContainer).width();
    var oldHeight = $(shadowContainer).height();
    var changeWidth = newWidth - oldWidth;
    var changeHeight = newHeight - oldHeight;

  // Make bottom 1px shadow width change
    var bShadow = $(containerName + " div.bShadow")[0];
    var bShadowWidth = $(bShadow).width();
    var newBShadowWidth = bShadowWidth + changeWidth;
    $(bShadow).css('width', newBShadowWidth + 'px');

  // Make right 1px shadow height change
    var rShadow = $(containerName + " div.rShadow")[0];
    var rShadowHeight = $(rShadow).height();
    var newRShadowHeight = rShadowHeight + changeHeight;
    $(rShadow).css('height', newRShadowHeight + 'px');

    var bShadows = $(containerName + " .bottomShadows");
    var bShadowsCurTop = $(bShadows[0]).position().top;
    var newBShadowsTop = bShadowsCurTop + changeHeight;
    $(bShadows).css('top', newBShadowsTop + 'px');

    $(shadowContainer).css('width', newWidth + 'px').css('height', newHeight + 'px');
  };

  UIEffects.prototype.initShowSourceDiv = function() {
    $("#codeOutput0").dialog({
      modal: true,
      overlay: {
        opacity: 0.5,
        background: "black"
      },
      title: 'Source Code',
      height: 600,
      width: 800,
      resizable: false,
      autoOpen: false,
      draggable: false
    });
  };

  UIEffects.prototype.showSource = function(code) {
    // TODO: Be on the lookout for another fix for this bug:
    // .dialog('open') in jQuery clones whatever's in the div, erases it, then
    // remakes the div and inserts it.  Problem is, cloning the HTMLEditor iFrame
    // from CodeMirror doesn't work, because you can't clone an iFrame completely
    // Thus, what I do, is create a new CodeMirror everytime...  but CodeMirror
    // keeps track of all of the divs it has editors in by ID, so I have to
    // make it think it's inserting in a new Div.  Whew, this sucks.
    if (typeof this.htmlEditor == 'undefined') {
      $('#codeOutput0').dialog('open').show();
      this.htmlEditor = new CodeMirror(document.getElementById('codeOutput0'), {
        parserfile: ["parsexml.js", "parsecss.js", "tokenizejavascript.js", "parsejavascript.js", "parsehtmlmixed.js"],
        stylesheet: ["../codemirror/css/jscolors.css", "../codemirror/css/csscolors.css", "../codemirror/css/xmlcolors.css"],
        autoMatchParens : true,
        path : '../codemirror/js/',
        height : '100%',
        width: '100%',
        content: code,
        onLoad: function() {}
      });
      this.numHTMLEditors = 0;
    } else {
      delete this.htmlEditor;
      // please god don't let anyone read this code..
      $('#codeOutput' + this.numHTMLEditors).empty();
      var newId = 'codeOutput' + (parseFloat(this.numHTMLEditors)+1);
      $('#codeOutput' + this.numHTMLEditors).attr('id', newId);
      this.numHTMLEditors++;

      $('#codeOutput' + this.numHTMLEditors).dialog('open').show();
      this.htmlEditor = new CodeMirror(document.getElementById('codeOutput' + this.numHTMLEditors), {
        parserfile: ["parsexml.js", "parsecss.js", "tokenizejavascript.js", "parsejavascript.js", "parsehtmlmixed.js"],
        stylesheet: ["../codemirror/css/jscolors.css", "../codemirror/css/csscolors.css", "../codemirror/css/xmlcolors.css"],
        autoMatchParens : true,
        path : '../codemirror/js/',
        height : '100%',
        width: '100%',
        content: code,
        onLoad: function() {}
      });
//      this.htmlEditor.setCode(code);
    }



//    $('#codeOutput').html('<textarea style="width: 100%;height: 100%;">' + code + '<\/textarea>').dialog('open').show();
  };

  UIEffects.prototype.createAutoComplete = function() {
    $("#search").autocomplete({
      data: is.autoCompleteData,
      matchContains: true,
      width: 'auto',
      scroll: false,
      scrollHeight: '400px',
      formatResult : function(result) {
        result = result[0].split(' <sup')[0];
        return result;
      },
      formatItem : function() {
        if (arguments.length > 3) {
          if (!$('.ui-autocomplete-results')[0].getAttribute('id')) {
            $('.ui-autocomplete-results')[0].id = 'acDiv';
          }
        }
        return arguments[0][0];
      }
    });
  };

  UIEffects.prototype.setAutoCompleteClicks = function() {
    $("#search").autocomplete('result', function(a, b, sampleName) {
      var sample = sampleName.split(' <sup>')[0];
      // This fixes a CRAZY bug in CodeMirror where in IE, it breaks if you
      // have the focus in another input element
      document.getElementById('edit').focus();
      window.is.showSample(window.is, sample)();
      return sample;
    });
  };

  UIEffects.prototype.createAutoCompleteDropShadow = function() {
    $('#search').bind('keyup', function() {
      var acDiv = $('#acDiv');
      try {
        if (acDiv.position() && acDiv.css('display') != 'none' && $('#acShadowDiv').length == 0) {
          $(acDiv).append($('<div id="acShadowDiv" style="width:100%;background: url(images/drop_shadows/short_b1px.png) repeat;height:15px;position:absolute;" class="">&nbsp<\/div>'));
        } else {}
      } catch(e) {}
    });
  };

  UIEffects.prototype.initAutoComplete = function() {
    $('#searchInputContainer').show();
    this.createAutoComplete();
    this.setAutoCompleteClicks();
    this.createAutoCompleteDropShadow();
  };

  UIEffects.prototype.initSaveCodeDiv = function() {
    $("#saveCodeForm").dialog({
      modal: true,
      overlay: {
        opacity: 0.5,
        background: "black"
      },
      title: 'Save Code',
      height: 300,
      width: 400,
      resizable: false,
      autoOpen: false,
      draggable: false
    });
    // $("div.ui-dialog > div.ui-resizable-handle").css('display', 'none');
  };

  UIEffects.prototype.showSaveForm = function() {
    var curSmapleObj = this.is.sampleFileNameToObject(this.is.getCurFilename());
    var boilerplateLoc = curSmapleObj.boilerplateLoc;
    $('#boilerplateLoc').attr('value', boilerplateLoc);
    // HUGE HACK.  In IE, an input element can't store a newline character,
    // or at least I can't find out how.  So they all get lost during the send
    // so on the server side i will parse out NEWLINE!!! and add in the correct
    // code :)
    var code = this.is.getCode();
    code = code.replace(/\n/g, 'NEWLINE!!!');
    $('#jscodeSaveForm').attr('value', code);

    $('#saveCodeForm').dialog('open').show();
  };

  UIEffects.prototype.toggleDropdown = function(elID, opt_close) {
    var el = $('#' + elID);
    if (opt_close) {
      el.removeClass('expanded');
      return;
    }
    
    if (el.hasClass('expanded')) {
      el.removeClass('expanded');
    } else {
      el.addClass('expanded');
    }
  };

  UIEffects.prototype.changeCodeSize = function(amount) {
    var editor = $('#editor');
    var edit = $('#edit');
    var select = $('#selectCode');
    var selContainer = $('#selectContainer');
    var codeContainer = $('#codeContainer');
    var curEditorHeight = editor.css('height');
    var curEditHeight = edit.css('height');
    var selectHeight = select.css('height');
    var selContainerHeight = selContainer.css('height');
    var codeContainerHeight = codeContainer.css('height');
    var newEditorHeight = parseFloat(curEditorHeight) + amount;
    var newEditHeight = parseFloat(curEditHeight) + amount;
    var newSelectHeight = parseFloat(selectHeight) + amount;
    var newSelContainerHeight = parseFloat(selContainerHeight) + amount;
    var newCodeContainerHeight = parseFloat(codeContainerHeight) + amount;
    editor.css('height', newEditorHeight + 'px');
    edit.css('height', newEditHeight + 'px');
    select.css('height', newSelectHeight + 'px');
    if (!newSelContainerHeight) {
      newSelContainerHeight = newCodeContainerHeight;
    }
    selContainer.css('height', newSelContainerHeight + 'px');

    codeContainer.css('height', newCodeContainerHeight + 'px');
    this.setDivShadow('outputDiv', 'runShadowContainer');
  };

  // TODO: make sure that user input is checked so that they don't use an existing sample name!!!!

  function RunBox() {
    this.outputContainer;
    this.runShadowContainer;
    this.runBoxPoppedOut;
    this.popoutWindow;
    this.is;
    this.runBoxDiv;
    this.popoutRunBoxDiv;
    this.resizable;
  }

  RunBox.prototype.init = function(is, resizable) {
    this.resizable = resizable;
    this.runBoxDiv = document.getElementById('runbox');
    this.runBoxPoppedOut = false;
    this.outputContainer = $("#outputContainer");
    this.runShadowContainer = $("#runShadowContainer");
    this.is = is;
  };

  RunBox.prototype.hideOnScreenRun = function() {
    // body...
  };

  RunBox.prototype.createIframe = function(boilerplateLoc) {
    var iFrame = $('<iframe src="'+boilerplateLoc+'" id="runFrame"><\/iframe>');
    iFrame = this.setNewCodeRunIframeWidthHeight(iFrame);
    $(this.runBoxDiv).empty().append(iFrame);
  };

  RunBox.prototype.setNewCodeRunIframeWidthHeight = function(iFrame) {
    var fakeDiv = $('<div id="fakeCalcDiv"><\/div>');
    $(this.runBoxDiv).prepend(fakeDiv);
    var outputDiv = $('#outputDiv');
    var containerHeight = outputDiv.height();
    var containerCurPos = outputDiv.offset();
    var curDivPos = $(fakeDiv).offset();
    var height = containerHeight - curDivPos.top + containerCurPos.top;
    if (this.resizable) height -= 15;

    return $(iFrame).css('height', height + 'px');
  };

  RunBox.prototype.runCode = function() {
    var curFilename = this.is.getCurFilename();
    var sampleObj = this.is.sampleFileNameToObject(curFilename);
    var boilerplateLoc = sampleObj.boilerplateLoc;

    if (!this.runBoxPoppedOut) {
      this.createIframe(boilerplateLoc);
    } else {
      // Run code in the popout window
      var runbox = this.popoutWindow.document.getElementById('runbox');
      runbox.innerHTML = '';

      this.popoutWindow.is = {
        'codeToRun': this.is.codeToRun
      };

      this.popoutWindow.addIframe(boilerplateLoc);
    }
  };

  RunBox.prototype.changeToPopout = function() {
    this.runBoxPoppedOut = true;
    $(this.outputContainer).hide();
    $(this.runShadowContainer).hide();
    this.popoutWindow = window.open('popout.html','popout', 'left=20,top=20,width=600,height=500,toolbar=1,resizable=1');
  };

  RunBox.prototype.changeToInline = function() {
    this.runBoxPoppedOut = false;
    $(this.outputContainer).show();
    $(this.runShadowContainer).show();
    this.is.runCode();
  };


  // Create and export the interactive sample instance to the global.
  window.is = new InteractiveSample();
})();