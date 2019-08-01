// cleidigh - update for TB 68.*

// encapsulation objet
if (!eu) var eu = {};
if (!eu.philoux) eu.philoux = {};
if (!eu.philoux.localfolder) eu.philoux.localfolder = {};

var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm');

eu.philoux.localfolder.lastFolder = "";

eu.philoux.localfolder.pendingFolders = [];

eu.philoux.localfolder.specialFolders = {
    "Inbox": { "localizedFolderName": "inboxFolderName", "flags": (Ci.nsMsgFolderFlags.Mail | Ci.nsMsgFolderFlags.Inbox) },
    "Sent": { "localizedFolderName": "sentFolderName", "flags": (Ci.nsMsgFolderFlags.Mail | Ci.nsMsgFolderFlags.SentMail) },
    "Trash": { "localizedFolderName": "trashFolderName", "flags": (Ci.nsMsgFolderFlags.Mail | Ci.nsMsgFolderFlags.Trash) },
    "Drafts": { "localizedFolderName": "draftsFolderName", "flags": (Ci.nsMsgFolderFlags.Mail | Ci.nsMsgFolderFlags.Drafts) },
    "Templates": { "localizedFolderName": "templatesFolderName", "flags": (Ci.nsMsgFolderFlags.Mail | Ci.nsMsgFolderFlags.Templates) },
    "Archives": { "localizedFolderName": "archivesFolderName", "flags": (Ci.nsMsgFolderFlags.Mail | Ci.nsMsgFolderFlags.Archive) },
    "Junk": { "localizedFolderName": "junkFolderName", "flags": (Ci.nsMsgFolderFlags.Mail | Ci.nsMsgFolderFlags.Junk) },
    "Outbox": { "localizedFolderName": "outboxFolderName", "flags": (Ci.nsMsgFolderFlags.Mail | Ci.nsMsgFolderFlags.Queue) }
}

// Extension Information Icons

eu.philoux.localfolder.addAllSpecialFolders = function () {
    const addAllCheckbox = document.getElementById("add_all_folders");
    let addFolderElements = document.querySelectorAll("[id^='add_folder_']");

    if (!!addAllCheckbox.checked) {
        // addFolderElements.checked 
        for (let index = 0; index < addFolderElements.length; index++) {
            const element = addFolderElements[index];
            console.debug('element ' + element.getAttribute("label"));
            element.checked = true;
            // element.disabled = !!addAllCheckbox;
        }
    }
}

eu.philoux.localfolder.toggleSpecialFolder = function (specialFolder) {
    eu.philoux.localfolder.LocalFolderTrace("Toggle special folder's");
    const addAllCheckbox = document.getElementById("add_all_folders");
    const addFolderElement = document.getElementById(`add_folder_${specialFolder}`);
    
    let addFolderElements = document.querySelectorAll("[id^='add_folder_']");

    eu.philoux.localfolder.LocalFolderTrace(`Add special folder: ${specialFolder}  ${addFolderElement.checked}`);
    if (!!addAllCheckbox.checked && !addFolderElement.checked) {
        addAllCheckbox.checked = false;
    } else if (!addAllCheckbox.checked && addFolderElements.every(e => e.checked)) {
        addAllCheckbox.checked = true;
    }

}

    eu.philoux.localfolder.addSpecialFolders = function (aParentFolder, aParentFolderPath) {
    
    eu.philoux.localfolder.LocalFolderTrace("Add special folders : " + aParentFolderPath);
    let addFolderElements = document.querySelectorAll("[id^='add_folder_']");

    
    var bundle = Services.strings.createBundle("chrome://messenger/locale/messenger.properties");
    msgWindow = Cc["@mozilla.org/messenger/msgwindow;1"].createInstance(Ci.nsIMsgWindow);

    for (let index = 0; index < addFolderElements.length; index++) {
        const element = addFolderElements[index];
        if (!!element.checked) {
            // Add special folder
            const l = element.getAttribute("SpecialFolder");
            const storeID =  aParentFolder.server.getCharValue("storeContractID");

            var ll = eu.philoux.localfolder.specialFolders[l].localizedFolderName;
            eu.philoux.localfolder.LocalFolderTrace('30  Add special folder: ' + l + '  ' + storeID + "   " + ll);
            if (l !== "Trash" && l !== "Unsent Messages") {
                aParentFolder.createSubfolder(l, msgWindow);
                // var sf = aParentFolder.addSubfolder(l);
                // sf.flags  = eu.philoux.localfolder.specialFolders[l].flags;

                eu.philoux.localfolder.LocalFolderTrace("Added subfolder : " + l );
            	var localizedFolderString = bundle.GetStringFromName(ll);
                var e = aParentFolder.subFolders;
                // while (e.hasMoreElements()) {
                    // eu.philoux.localfolder.LocalFolderTrace("Added folder : " + l + " "+ aParentFolder.numSubFolders + "  " + localizedFolderString);    
                    // eu.philoux.localfolder.LocalFolderTrace("Sub folder 0 : " + e.getNext().name);
                // }

                try {
                    aParentFolder.getChildNamed(localizedFolderString).flags = eu.philoux.localfolder.specialFolders[l].flags;
                    eu.philoux.localfolder.LocalFolderTrace("child " + localizedFolderString);
                } catch (error) {
                    eu.philoux.localfolder.LocalFolderTrace("child not found TryEnglish");
                    aParentFolder.getChildNamed(l).flags = eu.philoux.localfolder.specialFolders[l].flags;
                }
                // for (const folder of aParentFolder.subFolders) {

                    
                // aParentFolder.getChildNamed(localizedFolderString).flags = eu.philoux.localfolder.specialFolders[l].flags;
                // aParentFolder.getChildNamed(l).flags = eu.philoux.localfolder.specialFolders[l].flags;

                eu.philoux.localfolder.fixupSubfolder(aParentFolderPath, l, false, storeID);
                
                }

                }
            
        }
}


eu.philoux.localfolder.urlLoad = function (url) {
    let tabmail = eu.philoux.localfolder.getMail3Pane();
    // const ref = "https://thdoan.github.io/strftime/";
    tabmail.openTab("chromeTab", { chromePage: url });
}

eu.philoux.localfolder.getMail3Pane = function () {
    var w = Cc["@mozilla.org/appshell/window-mediator;1"]
        .getService(Ci.nsIWindowMediator)
        .getMostRecentWindow("mail:3pane");
    return w;
}

/**
 *	initialisation boite de création de dossier
 */
eu.philoux.localfolder.initDlg = function () {
    eu.philoux.localfolder.LocalFolderTrace("Init dialog");
          
    eu.philoux.localfolder.xulFixup();
    
    var bundle = Services.strings.createBundle("chrome://messenger/locale/messenger.properties");
    
    let addFolderElements = document.querySelectorAll("[id^='add_folderlabel_']");
    for (let index = 0; index < addFolderElements.length; index++) {
        const element = addFolderElements[index];
        var folder =  element.getAttribute("value");
        eu.philoux.localfolder.LocalFolderTrace("current name: " + folder + '  ' + eu.philoux.localfolder.specialFolders[folder].localizedFolderName);
        var localizedFolderString = bundle.GetStringFromName(eu.philoux.localfolder.specialFolders[folder].localizedFolderName);
        eu.philoux.localfolder.LocalFolderTrace("localized name: " + localizedFolderString);
        element.setAttribute("value", localizedFolderString);

    }


    document.getElementById("localfoldernom").focus();
}

eu.philoux.localfolder.xulFixup = function () {

	const versionChecker = Services.vc;
	const currentVersion = Services.appinfo.platformVersion;

	// cleidigh - TB68 groupbox needs hbox/label
	if (versionChecker.compare(currentVersion, "61") >= 0) {
        eu.philoux.localfolder.LocalFolderTrace("68 captions except");
		var captions = document.querySelectorAll("caption");
		for (let i = 0; i < captions.length; i++) {
			captions[i].style.display = "none";
		}
	} else {
		var groupboxtitles = document.querySelectorAll(".groupbox-title");
		for (let i = 0; i < groupboxtitles.length; i++) {
			groupboxtitles[i].style.display = "none";
		}
	}
}


/**
 *	création du dossier local (bouton valider)
 *	@return	true si ok, false si erreur
 */
eu.philoux.localfolder.btCreeDossierLocal = function () {
    try {

        
        //vérification des paramétres
        var nom = document.getElementById("localfoldernom").value;
        eu.philoux.localfolder.LocalFolderTrace("Add  folder: "+nom);
        if (nom == "") {
            eu.philoux.localfolder.LocalFolderAfficheMsgId("NomPasRenseigne");
            return false;
        }
        //nom pas déjà utilisé
        var accountmanager = Components.classes["@mozilla.org/messenger/account-manager;1"].getService(Components.interfaces.nsIMsgAccountManager);
        var serveurs = accountmanager.allServers;

        for (var i = 0; i < serveurs.length; i++) // introduce with TB 20
        {
            var srv = serveurs.queryElementAt(i, Components.interfaces.nsIMsgIncomingServer); // introduce with TB 20
            if (nom == srv.prettyName) {
                eu.philoux.localfolder.LocalFolderAfficheMsgId("DossierExisteDeja");
                return false;
            }
        }

        var dossier = document.getElementById("localfolderchemin").value;
        if (dossier == "") {
            eu.philoux.localfolder.LocalFolderAfficheMsgId("DossierPasRenseigne");
            return false;
        }

        // cleidigh - handle storage type
        var storeID = document.getElementById("server.storeTypeMenulist").value;
        var emptyTrashOnExit = document.getElementById("server.emptyTrashOnExit").checked;

        //création du dossier local
        eu.philoux.localfolder.creeDossierLocal(nom, dossier, storeID, emptyTrashOnExit);
    } catch (ex) {
        eu.philoux.localfolder.LocalFolderAfficheMsgId2("ErreurCreationDossier", ex);
        window.close();
        return false;
    }
    window.close();
    return true;
}

/**
 *	sélection du chemin d'un nouveau dossier
 *
 *	@return	true si ok, false si erreur
 *
 */
eu.philoux.localfolder.SelectChemin = function () {
    try {

        var nsIFilePicker = Components.interfaces.nsIFilePicker;
        var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
        var courant = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
        var selection = document.getElementById("localfolderchemin");
        fp.init(window, document.getElementById("localfoldercheminbtsel").getAttribute("localfolderchemin.browsertitle"), nsIFilePicker.modeGetFolder);
        fp.displayDirectory = courant;

        // cleidigh - replace deprecated show with asynchronous open for TB 60.*
        fp.open(function (rv) {
            eu.philoux.localfolder.LocalFolderTrace("eu.philoux.localfolder.SelectChemin appel eu.philoux.localfolder.ValidRepLocal:" + fp.file.path);

            if (rv !== nsIFilePicker.returnOK) {
                // user canceled
                return false;
            }

            var file = fp.file;
            var path = fp.file.path;
            // work with returned nsILocalFile...

            selection.value = fp.file.path;

            //vérifier que le chemin est valide
            // eu.philoux.localfolder.LocalFolderTrace("eu.philoux.localfolder.SelectChemin appel eu.philoux.localfolder.ValidRepLocal:"+fp.file.path);
            var bValid = eu.philoux.localfolder.ValidRepLocal(fp.file);
            // eu.philoux.localfolder.LocalFolderTrace("eu.philoux.localfolder.SelectChemin retour eu.philoux.localfolder.ValidRepLocal bValid:"+bValid);

            if (false == bValid) {
                eu.philoux.localfolder.LocalFolderAfficheMsgId("RepNonValide");
                return false;
            }

            //vérifier que l'emplacement n'est pas déjà utilisé
            var accountmanager = Components.classes["@mozilla.org/messenger/account-manager;1"].getService(Components.interfaces.nsIMsgAccountManager);
            var serveurs = accountmanager.allServers;

            for (var i = 0; i < serveurs.length; i++) // introduce with TB 20
            {
                var srv = serveurs.queryElementAt(i, Components.interfaces.nsIMsgIncomingServer); // introduce with TB 20
                var chemin = srv.localPath.nativePath;
                if (fp.file.path.toLowerCase() == chemin.toLowerCase()) {
                    eu.philoux.localfolder.LocalFolderAfficheMsgId("RepertoireDejaUtilise");
                    return false;
                }
                //else alert("'"+chemin+"'!='"+fp.file.path+"'");
            }

            selection.value = fp.file.path;
        });

    } catch (ex) {
        alert(ex);
        return false;
    }

    return true;
}


/**
 *	creation du compte de dossier local
 *
 *	@param nom nom d'affichage du dossier
 *	@param chemin disque du dossier
 *
 *	@return	instance  nsIMsgAccount du compte créé si ok, false si erreur
 *
 *	implémentation : l'appel à cette fonction suppose que l'appelant a vérifier que le compte n'existe pas déjà
 *	nom et chemin pas déjà utilisés
 */
eu.philoux.localfolder.creeDossierLocal = function (nom, chemin, storeID, emptyTrashOnExit) {

    try {
        var accountmanager = Components.classes["@mozilla.org/messenger/account-manager;1"].getService(Components.interfaces.nsIMsgAccountManager);
        var srv = accountmanager.createIncomingServer("nobody", nom, "none");
        var filespec = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
        filespec.initWithPath(chemin);
        srv.prettyName = nom;
        srv.localPath = filespec;

        let defaultStoreID = Services.prefs.getCharPref("mail.serverDefaultStoreContractID");
        srv.setCharValue("storeContractID", storeID);
        srv.emptyTrashOnExit = emptyTrashOnExit;
        
        // let defaultStoreID = Services.prefs.getCharPref("mail.serverDefaultStoreContractID");
        let c = srv.getBoolValue("canChangeStoreType");
        
        eu.philoux.localfolder.LocalFolderTrace("CreateLocal 6  folder: "+ chemin + "\neTrash : " + emptyTrashOnExit);
        eu.philoux.localfolder.LocalFolderTrace("defaultstore: " + defaultStoreID);
        // srv.storeContractId = "@mozilla.org/msgstore/maildirstore;1";

        eu.philoux.localfolder.LocalFolderTrace("CanChangestore: " + c);
        eu.philoux.localfolder.LocalFolderTrace("Original store/Current: "+ storeID + "  " );
        
        eu.philoux.localfolder.lastFolder = chemin;
        
        // Services.prompt.alert(window, "progress", "Before at subfolders");

        var account = accountmanager.createAccount();
        account.incomingServer = srv;

        // Services.prompt.alert(window, "progress", "After create account");

        msgWindow = Cc["@mozilla.org/messenger/msgwindow;1"].createInstance(Ci.nsIMsgWindow);

           // srv.rootMsgFolder.recursiveDelete(true, msgWindow);
        // srv.rootFolder.deleteSubFolders(["Trash"], msgWindow);

		eu.philoux.localfolder.fixupSubfolder(chemin, "Trash", false, storeID);
		eu.philoux.localfolder.fixupSubfolder(chemin, "Unsent Messages", false, storeID);


		eu.philoux.localfolder.pendingFolders.push(chemin);

        eu.philoux.localfolder.addSpecialFolders(srv.rootMsgFolder, chemin);
        eu.philoux.localfolder.LocalFolderTrace("Add special subfolders" );

		var notifyFlags = Ci.nsIFolderListener.added;
		srv.rootMsgFolder.AddFolderListener(FolderListener, notifyFlags);
		eu.philoux.localfolder.LocalFolderTrace("Added folder listener");


        return account;
    } catch (ex) {
        eu.philoux.localfolder.LocalFolderAfficheMsgId2("ErreurCreationDossier", ex);
        return false;
    }

    return false;
}


eu.philoux.localfolder.fixupSubfolder = function (parentName, folderName, removeFileFolder, storeID) {

	eu.philoux.localfolder.LocalFolderTrace(`fixupSubfolder: ${folderName} - remove file folder: ${removeFileFolder}  storeType: ${storeID}`);
	var filespec = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
    var rf = `${parentName}\\${folderName}`
    
    // let StoreID = srv.getCharValue("storeContractID");

    // var StoreID = "@mozilla.org/msgstore/maildirstore;1";
	filespec.initWithPath(parentName);
	filespec.append(folderName);

    if (removeFileFolder) {
        eu.philoux.localfolder.LocalFolderTrace(`removing file folder: and MSF 3`);

        filespec.initWithPath(parentName);
        filespec.append(folderName);
        filespec.remove(true);

        return;
    }

    eu.philoux.localfolder.LocalFolderTrace(`saving folder: ${rf}`);
	// if (removeFileFolder) {
    if (storeID !== "@mozilla.org/msgstore/maildirstore;1") {
        eu.philoux.localfolder.LocalFolderTrace(`removing file folder: ${rf}`);
        try {
            
    		filespec.remove(true);
            eu.philoux.localfolder.LocalFolderTrace(`fixupSubfolder - removed folder`);
        } catch (error) {
            eu.philoux.localfolder.LocalFolderTrace(`no folder found removing file folder: ${rf}`);
        }
    }
    
    if (storeID === "@mozilla.org/msgstore/maildirstore;1") {
        filespec.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);
    	eu.philoux.localfolder.LocalFolderTrace(`fixupSubfolder done - CREATED DIRECTORY`);

    } else {
        filespec.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0644);
        eu.philoux.localfolder.LocalFolderTrace(`fixupSubfolder done - create file`);
    }
    }

var FolderListener = {
	OnItemAdded: function(parentFolder, aItem)
     { 
		eu.philoux.localfolder.LocalFolderTrace(`item added 3: ${parentFolder.filePath.path} ${parentFolder.flags}  ${aItem.filePath.path}  ${aItem.flags} ${eu.philoux.localfolder.pendingFolders[0]}`);
		var rf =  `${aItem.filePath.path}`;
		rf = rf.replace(`\\${aItem.name}`, "");
 
		if ( eu.philoux.localfolder.pendingFolders.includes(`${rf}`) && (aItem.flags & 0x000004)) {
			var filespec = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
			eu.philoux.localfolder.fixupSubfolder(eu.philoux.localfolder.pendingFolders[0], aItem.name, false, aItem.server.getCharValue("storeContractID"));
			
			if (aItem.name in eu.philoux.localfolder.specialFolders) {
				var sf = eu.philoux.localfolder.specialFolders[aItem.name].flags
				eu.philoux.localfolder.LocalFolderTrace(`${aItem.name} get flags ${aItem.flags}`);
				aItem.setFlag(sf);
				eu.philoux.localfolder.LocalFolderTrace(`${aItem.name} set flags (${sf} : ${aItem.flags}`);
			}
			
		}
     }, 

	OnItemRemoved() {},
	OnItemPropertyChanged() {},
	OnItemIntPropertyChanged() {},
	OnItemBoolPropertyChanged() {},
	OnItemUnicharPropertyChanged() {},
	OnItemPropertyFlagChanged() {},
	OnItemEvent() {},
  };
  


/**
 *	test si un répertoire est valide pour créer un dossier local
 *	@param rep instance nsIFile
 *	@return true si valid, sinon false 
 *	implémentation : true si vide ou contient un ou plus ficher .msf
 *	
 */
eu.philoux.localfolder.ValidRepLocal = function (rep) {
    try {
        var bValid = true;
        var item = null;
        var iter = rep.directoryEntries;
        while (iter.hasMoreElements()) {
            bValid = false;
            item = iter.getNext();
            item = item.QueryInterface(Components.interfaces.nsIFile);
            if (item.isDirectory()) {
                bValid = eu.philoux.localfolder.ValidRepLocal(item);
                if (bValid) {
                    break;
                }
            } else if (item.isFile()) {
                var tab = item.leafName.split(".");
                if (tab.length) {
                    if ("msf" == tab[tab.length - 1]) {
                        bValid = true;
                        break;
                    }
                }
            }
        }
        return bValid;
    } catch (ex) {
        return false;
    }
    return false;
}
