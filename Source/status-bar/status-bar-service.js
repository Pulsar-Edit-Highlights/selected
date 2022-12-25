
const StatusBarView = require('./status-bar-view');


const { config } = atom;


module.exports = class StatusBarService {

    constructor ( statusBar , selectionManager ){

        this.selectionManager = selectionManager;
        this.statusBar = statusBar;

        this.updateCount = this.updateCount.bind(this);

        this.listenForStatusBarConfigChange();
        this.setupListeners();

        this.setupStatusBarView();
    }


    destroy (){

        this.removeStatusBarView();

        this.selectionSubscription?.dispose();
    }


    listenForStatusBarConfigChange (){
        return config.onDidChange('highlight-selected.showInStatusBar',( changed ) => {
            return ( changed.newValue )
                ? this.setupStatusBarView()
                : this.removeStatusBarView()
        });
    }


    setupListeners (){
        this.selectionManager.onDidFinishAddingMarkers(this.updateCount);
        this.selectionManager.onDidRemoveAllMarkers(this.updateCount);
    }


    setupStatusBarView (){

        if( this.statusBarElement )
            return

        if( ! config.get('highlight-selected.showInStatusBar') )
            return

        this.statusBarElement =
            new StatusBarView;

        this.statusBarTile = this.statusBar
            .addLeftTile({
                priority : 100 ,
                item : this.statusBarElement.getElement()
            })
    }


    removeStatusBarView (){

        if( ! this.statusBarElement)
            return

        this.statusBarElement.removeElement();

        if( this.statusBarTile )
            this.statusBarTile.destroy();

        this.statusBarElement = null;
        this.statusBarTile = null;
    }


    updateCount (){

        if( ! this.statusBarElement )
            return

        this.statusBarElement
            .updateCount(this.selectionManager.resultCount);
    }
}
