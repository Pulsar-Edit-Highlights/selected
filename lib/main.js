const { CompositeDisposable } = require('atom');
const ScrollMarkersService = require('./scroll-markers/scroll-markers-service');
const StatusBarService = require('./status-bar/status-bar-service');
const SelectionManager = require('./selection-manager');


const { commands } = atom;


module.exports = {

    selectionManager: null,

    activate (){

        this.selectionManager = new SelectionManager;
        this.subscriptions = new CompositeDisposable;

        this.subscriptions.add(this.listenForCommands());

        this.scrollMarkersService = new ScrollMarkersService(this.selectionManager);
    },

    deactivate (){

        this.scrollMarkersService?.destroy();
        this.selectionManager?.destroy();
        this.statusBarService?.destroy();
        this.subscriptions?.dispose();

        this.scrollMarkersService = null;
        this.selectionManager = null;
        this.statusBarService = null;
        this.subscriptions = null;
    },

    provideHighlightSelectedV1Deprecated (){
        return this.selectionManager
    },

    provideHighlightSelectedV2 (){
        return this.selectionManager
    },

    consumeStatusBar(statusBar){
        this.statusBarService =
            new StatusBarService(statusBar,this.selectionManager);
    },

    toggle (){
        return (this.selectionManager.disabled)
            ? this.selectionManager.enable()
            : this.selectionManager.disable()
    },

    selectAll (){
        return this.selectionManager.selectAll()
    },

    consumeScrollMarker ( scrollMarkerAPI ){
        this.scrollMarkersService
            .setScrollMarkerAPI(scrollMarkerAPI);
    },

    listenForCommands (){
        return commands.add('atom-workspace',{
            'highlight-selected:select-all': () => this.selectAll() ,
            'highlight-selected:toggle': () => this.toggle()
        })
    }
};
