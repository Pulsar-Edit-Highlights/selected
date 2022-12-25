
const { CompositeDisposable } = require('atom');


const { workspace , config } = atom;


module.exports = class ScrollMarkersService {

    static ensureScrollViewInstalled (){

        if( atom.inSpecMode() )
            return

        require('atom-package-deps')
            .install('highlight-selected',true);
    }


    constructor ( selectionManager ){

        this.selectionManager = selectionManager;

        if( config.get('highlight-selected.showResultsOnScrollBar') ){

            ScrollMarkersService.ensureScrollViewInstalled();

            workspace
            .getTextEditors()
            .forEach((editor) => this.setScrollMarkerView(editor));
        }

        this.setupEditorSubscriptions();
        this.setupConfigObserver();
    }


    destroy (){
        this.enableScrollViewObserveSubscription.dispose();
        this.editorSubscriptions.dispose();
    }


    setScrollMarkerAPI ( scrollMarkerAPI ){
        this.scrollMarkerAPI = scrollMarkerAPI;
    }


    setupEditorSubscriptions (){

        this.editorSubscriptions = new CompositeDisposable();

        this.editorSubscriptions.add(
            workspace.observeTextEditors((editor) => {
                this.setScrollMarkerView(editor);
            }));

        this.editorSubscriptions.add(
            workspace.onWillDestroyPaneItem((item) => {

                if( item.item.constructor.name !== 'TextEditor' )
                    return

                const editor = item.item;

                this.destroyScrollMarkers(editor);
            }));
    }


    setupConfigObserver (){

        this.enableScrollViewObserveSubscription = config.observe(
            'highlight-selected.showResultsOnScrollBar',
            ( enabled ) => {

                if( enabled ){
                    ScrollMarkersService.ensureScrollViewInstalled();
                    workspace.getTextEditors()
                    .forEach((editor) => this.setScrollMarkerView(editor));
                } else {
                    workspace.getTextEditors()
                    .forEach((editor) => this.destroyScrollMarkers(editor));
                }
            }
        );
    }


    setScrollMarkerView ( editor ){

        if( ! config.get('highlight-selected.showResultsOnScrollBar') )
            return

        if( ! this.scrollMarkerAPI )
           return

        const scrollMarkerView = this.scrollMarkerAPI
            .scrollMarkerViewForEditor(editor);

        const markerLayer = this.selectionManager
            .editorToMarkerLayerMap[editor.id].visibleMarkerLayer;

        const { selectedMarkerLayer } = this.selectionManager
            .editorToMarkerLayerMap[editor.id];

        scrollMarkerView
        .getLayer('highlight-selected-marker-layer')
        .syncToMarkerLayer(markerLayer);

        scrollMarkerView
        .getLayer('highlight-selected-selected-marker-layer')
        .syncToMarkerLayer(selectedMarkerLayer);
    }


    destroyScrollMarkers(editor) {

        if( ! this.scrollMarkerAPI )
            return

        const scrollMarkerView = this.scrollMarkerAPI
            .scrollMarkerViewForEditor(editor);

        scrollMarkerView.destroy();
    }
}
