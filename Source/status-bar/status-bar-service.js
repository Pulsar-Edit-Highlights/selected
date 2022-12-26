
const StatusBarView = require('./status-bar-view');


const { config } = atom;


class StatusBarService {

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

        const { selectionManager } = this;

        selectionManager.onDidFinishAddingMarkers(this.updateCount);
        selectionManager.onDidRemoveAllMarkers(this.updateCount);
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
                item : this.statusBarElement.element
            })
    }


    removeStatusBarView (){

        if( ! this.statusBarElement)
            return

        this.statusBarElement.removeElement();
        this.statusBarTile?.destroy();

        this.statusBarElement = null;
        this.statusBarTile = null;
    }


    updateCount (){

        const { statusBarElement , selectionManager } = this;

        statusBarElement?.updateCount(
            selectionManager.resultCount);
    }
}



module.exports = StatusBarService;
