/******************************************************
  COPYRIGHT NOTICE                                   
  Copyright (C) Ing. Tomáš Holý, http://www.TomasHoly.com                 
  All rights reserved.     
  
  popis souboru: javascriptove fce       
******************************************************/

// odecitani znaku u formulare
function marks(values, IDV, D) {
	R = values.value;
	if (R.length > D) {
		NR = R.substring(0,D);
		values.value = NR;
		document.getElementById(IDV).className = 'znakyBad';
	}
	else {
    NR = R;
    document.getElementById(IDV).className = 'znakyOk';
	}
	document.getElementById(IDV).innerHTML = (D-NR.length);
}

// vlozeni smajliku do textu
function smile(myValue) {
	
	var myField = document.getElementById('text');
	
	// IE support
	if (document.selection) {
		myField.focus();
		sel = document.selection.createRange();
		sel.text = myValue;
	}
	// MOZILLA/NETSCAPE support
	else if (myField.selectionStart || myField.selectionStart == '0') {
		
		var startPos = myField.selectionStart;
		var endPos = myField.selectionEnd;
		
		myField.value = myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length);
	}
	else {
		myField.focus();
		myField.value += myValue;
	}
}

// checkForm (version 3.4) by Riki "Fczbkk" Fridrich, 2003 - 2004
// http://www.fczbkk.com/, mailto:riki@fczbkk.com

// library for cross-browser event management
evt = {

	// attach event
	add : function(obj, evType, fn, useCapture) {
		// Opera hack
		if (window.opera && (obj == window)) {
			obj = document;
		}
		
		if (obj.addEventListener){
			obj.addEventListener(evType, fn, useCapture);
			return true;
		} else if (obj.attachEvent){
			var r = obj.attachEvent("on"+evType, fn);
			return r;
		} else {
			return false;
		}
	},
	
	// remove event
	remove : function(obj, evType, fn, useCapture) {
		// Opera hack
		if (window.opera && (obj == window)) {
			obj = document;
		}
		
		if (obj.removeEventListener) {
			obj.removeEventListener(evType, fn, useCapture);
			return true;
		} else if (obj.detachEvent) {
			var r = obj.detachEvent("on"+evType, fn);
			return r;
		} else {
			return false;
		}
	},
	
	// fix for IE event model
	fix : function(e) {
		if (typeof e == 'undefined') e = window.event;
		if (typeof e.target == 'undefined') e.target = e.srcElement;
		if (typeof e.layerX == 'undefined') e.layerX = e.offsetX;
		if (typeof e.layerY == 'undefined') e.layerY = e.offsetY;
		if ((typeof e.which == 'undefined') && e.keyCode) e.which = e.keyCode;

		// thanx to KKL2401 for preventDefault hack
		if (!e.preventDefault) e.preventDefault = function() {
			e.returnValue = false;
		}

		return e;
	}

}

// library for working with multiple classes
var cls = {
	
	// vrati pole obsahujuce vsetky triedy daneho elementu
	get : function (elm) {
		if (elm && elm.tagName) {
			var classes = [];
			if (elm.className) {	// na zaklade Centiho upozornenia o divnej interpretacii v Opere
				var cl = elm.className.replace(/\s+/g, " ");
				classes = cl.split(" ");
			}
			return classes;
		}
		return false;
	},
	
	// vrati true, ak element obsahuje triedu
	has : function (elm, cl) {
		if ((actCl = cls.get(elm)) && (typeof(cl) == "string")) {
			for (var i = 0; i < actCl.length; i++) {
				if (actCl[i] == cl) {
					return true;
				}
			}
		}
		return false;
	},
	
	// prida triedu elementu
	add : function (elm, cl) {
		if ((actCl = cls.get(elm)) && (typeof(cl) == "string")) {
			if (!cls.has(elm, cl)) {
				elm.className += (actCl.length > 0) ? " " + cl : cl;
			}
			return true;
		}
		return false;
	},
	
	// odstrani triedu z elementu
	remove : function (elm, cl) {
		if ((actCl = cls.get(elm)) && (typeof(cl) == "string")) {
			tempCl = "";
			for (var i = 0; i < actCl.length; i++) {
				if (actCl[i] != cl) {
					if (tempCl != "") {tempCl += " ";}
					tempCl += actCl[i];
				}
				elm.className = tempCl;
			}
			return true;
		}
		return false;
	},
	
	// nahradi staru triedu elementu novou, ak stara neexistuje, prida novu
	replace : function (elm, oldCl, newCl) {
		if ((actCl = cls.get(elm)) && (typeof(oldCl) == "string") && (typeof(newCl) == "string")) {
			tempCl = "";
			if (cls.has(elm, newCl)) {
				cls.remove(elm, oldCl);
			} else if (cls.has(elm, oldCl)) {
				for (var i = 0; i < actCl.length; i++) {
					if (tempCl != "") {tempCl += " ";}
					tempCl += (actCl[i] == oldCl) ? newCl : actCl[i];
				}
				elm.className = tempCl;
			} else {
				cls.add(elm, newCl);
			}
			return true;
		}
		return false;
	}

}

checkForm = {
	
	invalidMsg			: "Formulář není vyplněn správně.\nProsíme opravte tato políčka: %err",
	errorMsg			: "\n- %err",
	errors				: [],

	invalidClass		: "invalid",
	requiredClass		: "required",
	outsideInvalidClass	: "outsideInvalid",

	submitOnceClass		: "submitOnce",
	alreadySubmitedClass: "alreadySubmited",
	
	fieldType			: [],
	defaultValue		: [],
	
	// inicializacia skriptu
	init : function () {
		// ak mame k dispozicii kniznice evt a cls a browser je standards-compliant, mozeme zacat
		if (evt && cls && document.getElementById) {
			// prejdeme vsetky formulare a najdeme v nich vsetky fieldy, zavesime potrebne eventy
			var forms = document.getElementsByTagName("form");
			for (var i = 0; i < forms.length; i++) {
				evt.add(forms[i], "submit", checkForm.checkForm);
				evt.add(forms[i], "reset", checkForm.checkForm);
				
				var fields = checkForm.getFields(forms[i]);
				for (var j = 0; j < fields.length; j++) {
					evt.add(fields[j], "blur", checkForm.checkField);
					evt.add(fields[j], "focus", checkForm.checkField);
					evt.add(fields[j], "change", checkForm.checkField);
					// kontrola pri onkeyup sposobuje problemy s nepristupnostou policka v niektorych prehliadacoch, ak obsahuje nespravnu hodnotu
					/*
					if ((fields[j].tagName.toLowerCase() == "input") && ((fields[j].type == "text") || (fields[j].type == "password"))) {
						evt.add(fields[j], "keyup", checkForm.checkField);
					}
					*/
				}
				
				checkForm.checkForm(forms[i]);
			}
			return true;
		}
		return false;
	},
	
	// vrati pole obsahujuce vsetky polia, ktore budeme kontrolovat
	getFields : function(frm) {
		if (frm && frm.getElementsByTagName) {
			var fields = [];
			
			var inputs = frm.getElementsByTagName("input");
			for (var i = 0; i < inputs.length; i++) {
				if (
					inputs[i].type == "text" ||
					inputs[i].type == "hidden" ||
					inputs[i].type == "password"
				) {
					fields[fields.length] = inputs[i];
				}
			}
			
			var textareas = frm.getElementsByTagName("textarea");
			for (var i = 0; i < textareas.length; i++) {
				fields[fields.length] = textareas[i];
			}
			
			var selects = frm.getElementsByTagName("select");
			for (var i = 0; i < selects.length; i++) {
				fields[fields.length] = selects[i];
			}
			return fields;
		}
		return false;
	},
	
	// preveri validitu vsetkych policok a povoli alebo nepovoli submit
	checkForm : function(frm) {
		if (!frm || !frm.tagName || frm.tagName.toLowerCase() != "form") {
			e = evt.fix(frm);
			frm = e.target;
		} else {
			var e = false;
		}
		
		checkForm.errors = [];
		
		var fields = checkForm.getFields(frm);
		var fieldsOK = true;
		for (var i = 0; i < fields.length; i++) {
				fieldsOK = ((checkForm.checkField(fields[i]) == "valid") && fieldsOK) ? true : false;
		}
		
		if (fieldsOK) {

			// kontrola formularov, ktore sa mozu odosielat iba raz
			if (e && (e.type == "submit") && cls.has(frm, checkForm.submitOnceClass)) {
				if (cls.has(frm, checkForm.alreadySubmitedClass)) {
					e.preventDefault;
					return false;
				} else {
					cls.add(frm, checkForm.alreadySubmitedClass);
				}
			}

			return true;
		} else {
			if (e && (e.type == "reset")) {
				return;
			}
			if (e && (e.type == "submit")) {
				var err = "";
				for (var i = 0; i < checkForm.errors.length; i++) {
					err += checkForm.errorMsg.replace("%err", checkForm.errors[i]);
				}
				alert(checkForm.invalidMsg.replace("%err", err));
				if (e.preventDefault) {
					e.preventDefault();
				}
			}
		}
		
		return false;
	},
	
	// preveri validitu policka a vrati "valid" alebo "invalid"
	checkField : function(elm) {
		if (!elm || !elm.tagName) {
			var e = evt.fix(elm);
			elm = e.target;
		}
		
		if (
			elm &&
			(
				(elm.tagName.toLowerCase() == "input") ||
				(elm.tagName.toLowerCase() == "select") ||
				(elm.tagName.toLowerCase() == "textarea")
			)
		) {
			var fieldOK = true;
			var elmClasses = cls.get(elm);
			for (var i = 0; i < elmClasses.length; i++) {
				if (checkForm.fieldType[elmClasses[i]]) {
					var rule = checkForm.fieldType[elmClasses[i]];
					if (fieldOK && typeof(rule) == "string") {
						
						// pravidlo je string
						if (elm.value != "") {
							fieldOK = (elm.value.search(new RegExp("^([" + rule + "]){1,}$")) < 0) ? false : true;
						}
						
					} else if (fieldOK && ((typeof(rule) == "function") || (typeof(rule) == "object")) && rule.source) {
						// Mozilla vracia RegExpu typ "function", zatial co ostatne browsery "object"
						
						// pravidlo je regExp
						if (elm.value != "") {
							fieldOK = (elm.value.search(rule) < 0) ? false : true;
						}
						
					} else if (fieldOK && (typeof(rule) == "function") && rule.prototype) {
						
						// pravidlo je funkcia
						fieldOK = rule(e, elm);
						
					}
				}

				/* default value
				if (e && checkForm.defaultValue[elmClasses[i]]) {
					var val = checkForm.defaultValue[elmClasses[i]];
					if ((e.type == "focus") && (elm.value == "")) {
						elm.value = val;
					}
					if ((e.type == "blur") && (elm.value == val)) {
						elm.value = "";
					}
				}
				*/
			}

			
			var outsideValidationOK = !cls.has(elm, checkForm.outsideInvalidClass);


			if (fieldOK && outsideValidationOK) {
				cls.remove(elm, "invalid");
			} else {
				cls.add(elm, "invalid");
				checkForm.errors[checkForm.errors.length] = checkForm.getFieldErrorMsg(elm);
				//(elm.checkFormErr) ? elm.checkFormErr : (elm.title) ? elm.title : (elm.name) ? elm.name : elm.toString();
			}
			
			return (fieldOK && outsideValidationOK) ? "valid" : "invalid";
		}
		return false;
	},
	
	// prida novy typ policka
	addFieldType : function(cls, rule, defaultValue) {
		if (cls && (rule || defaultValue)) {
			if (rule) {
				checkForm.fieldType[cls] = rule;
			}
			if (defaultValue) {
				checkForm.defaultValue[cls] = defaultValue;
			}
			return true;
		}
		return false;
	},
	
	getFieldErrorMsg : function(elm) {
		if (elm) {
			if (elm.checkFormErrorMsg) {
				return elm.checkFormErrorMsg;
			}
			if (elm.title) {
				return elm.title;
			}
			if (elm.id) {
				var labels = document.getElementsByTagName("label");
				for (var i = 0; i < labels.length; i++) {
					if (labels[i].attributes["for"] && (labels[i].attributes["for"].value == elm.id)) {
						// Opera nezvlada atribut "for"
						var str = checkForm.getNodeText(labels[i]);
						return str;
					}
				}
				return elm.id;
			}
			if (elm.name) {
				return elm.name;
			}
			return elm.toString();
		}
		return false;
	},
	
	getNodeText : function(node) {
		var str = "";
		if (node && node.hasChildNodes()) {
			for (var i = 0; i < node.childNodes.length; i++) {
				// TODO: skladanie toho stringu treba urobit nejak systemovejsie a prehladnejsie
				str += (node.childNodes[i].nodeType == 3) ? node.childNodes[i].nodeValue : checkForm.getNodeText(node.childNodes[i]);
				if ((node.childNodes[i].nodeType == 1) && (node.childNodes[i].tagName.toLowerCase() == "img") && (node.childNodes[i].attributes["alt"])) {
					str += node.childNodes[i].attributes["alt"].value;
				}
			}
		}
		return str;
	}
	
}

/* basic field types */

// required field
checkForm.addFieldType(
	"required",
	function(evt, elm) {
		if (elm) {
			if (elm.tagName.toLowerCase() == "select") {
				return (elm.value) ? true : false;
			} else {
				return (elm.value.search(/\S/) < 0) ? false : true;
			}
		}
		return false;
	}
);

// numbers only
checkForm.addFieldType(
	"numbers",
	"0123456789"
);

// IDs - numbers divided by space
checkForm.addFieldType(
	"ids",
	new RegExp("^[0-9 ]{1,}$")
);

// safe characters (alphanumeric, numbers and underscore)
checkForm.addFieldType(
	"safeChars",
	new RegExp("^[a-zA-Z0-9_]{1,}$")
);

// date

// jednoducha kontrola pomocou regExp
/* 
checkForm.addFieldType(
	"date",						// in format (D)D.(M)M.YYYY
	new RegExp("^[0-9]{1,2}[.][0-9]{1,2}[.][0-9]{4}$")
);
*/

// komplexnejsia kontrola pomocou funkcie (pocty dni v mesiaci, prestupne roky a pod.)
checkForm.addFieldType(
	"date",
	function (evt, elm) {
		if (!elm.value) {return true;}

		var date = elm.value.split(".");
		var day = date[0];
		var month = date[1];
		var year = date[2];
		if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
			// mesiac
			if ((month > 12) || (month < 1)) {return false;}
			
			// dni
			if (day < 1) {return false;}
			
			var maxDays = 31;
			if (month == 2) {maxDays = (year%4 == 0) ? 29 : 28;} // kontrola prestupneho roku
			if ((month == 4) || (month == 6) || (month == 9) || (month == 11)) {maxDays = 30;}

			if (day > maxDays) {return false;}
			
			return true;
		}
		return false;
	}
);

// URL
checkForm.addFieldType(
	"url",
	new RegExp("^\\w+://(([\\w\\+\\.\\-]+\\b)(:\\w+)@)?([/\\w\\+\\.\\-]+\\b)(\/{1})?(\\?[\\w\\+\\.\\-/;\\&@=]+\\b)?(#[\\w\\-%]+\\b)?$"),
	//   protokol^      ^user       password^       ^server   konc. slash^       ^parametry (?)                 ^relativní odkaz (#)                                                
	//new RegExp("^[http|https|ftp]:\/\/[a-zA-Z0-9]+([-_\.]?[a-zA-Z0-9])*\.[a-zA-Z]{2,4}(\/{1}[-_~&=\?\.a-z0-9]*)*$"),
	"http://"
);

// e-mail
checkForm.addFieldType(
	"email",
	new RegExp("^([\\w\\!\\#\\$\\%\\&\\*\\+\\-\\/\\=\\?\\^\\{\\}\\|\\~]+)((\\.){1}[\\w\\!\\#\\$\\%\\&\\*\\+\\-\\/\\=\\?\\^\\{\\}\\|\\~]+)*@[\\w\\!\\#\\$\\%\\&\\*\\+\\-\\/\\=\\?\\^\\{\\}\\|\\~]+((\\.){1}[\\w\\!\\#\\$\\%\\&\\*\\+\\-\\/\\=\\?\\^\\{\\}\\|\\~]+)+$"),
	//new RegExp("^[a-z0-9]+[a-z0-9\._-]*[a-z0-9]+@[a-z0-9]+[a-z0-9\._-]*[a-z0-9]+\.[a-z]{2,4}$")
	//new RegExp("^[a-zA-Z0-9]+[a-zA-Z0-9\._-]*[a-zA-Z0-9]+@[a-zA-Z0-9]+[a-zA-Z0-9\._-]*[a-zA-Z0-9]+\.[a-zA-Z]{2,4}$")
	"@"
);

// zavolanie inicializacie checkForm-u pri zavedeni dokumentu
evt.add(window, "load", checkForm.init);