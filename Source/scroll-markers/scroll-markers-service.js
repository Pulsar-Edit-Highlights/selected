
const { CompositeDisposable } = require('atom');


const { workspace , config } = atom;



const showResultsOnScrollbar = () =>
    config.get('highlight-selected.showResultsOnScrollBar');



module.exports = class ScrollMarkersService {

    static ensureScrollViewInstalled (){

        if( atom.inSpecMode() )
            return

        require('atom-package-deps')
            .install('highlight-selected',true);
    }


    editorSubscriptions = new CompositeDisposable;
    selectionManager;
    configObserver;
    api;


    constructor ( selectionManager ){

        this.selectionManager = selectionManager;

        if( showResultsOnScrollbar() ){

            ScrollMarkersService.ensureScrollViewInstalled();

            workspace
            .getTextEditors()
            .forEach((editor) => this.setScrollMarkerView(editor));
        }

        this.editorSubscriptions
            .add( ... this.setupEditorSubscriptions() );

        this.setupConfigObserver();
    }


    destroy (){
        this.configObserver.dispose();
        this.editorSubscriptions.dispose();
    }


    setScrollMarkerAPI ( api ){
        this.api = api;
    }


    * setupEditorSubscriptions (){

        yield workspace
            .observeTextEditors((editor) =>
                this.setScrollMarkerView(editor));

        yield workspace
            .onWillDestroyPaneItem(({ item }) => {

                if( item.constructor.name !== 'TextEditor' )
                    return

                this.destroyScrollMarkers(item);
            });
    }


    setupConfigObserver (){

        const onChange = ( enabled ) => {

            if( enabled )
                ScrollMarkersService.ensureScrollViewInstalled();

            const processMarkers = ( enabled )
                ? ( editor ) => this.setScrollMarkerView(editor)
                : ( editor ) => this.destroyScrollMarkers(editor) ;

            workspace
            .getTextEditors()
            .forEach(processMarkers);
        }

        this.configObserver = config
            .observe('highlight-selected.showResultsOnScrollBar',onChange);
    }


    setScrollMarkerView ( editor ){

        if( ! showResultsOnScrollbar() )
            return


        const { selectionManager , api } = this;

        if( ! api )
           return


        const view = api
            .scrollMarkerViewForEditor(editor);

        const { selectedMarkerLayer , visibleMarkerLayer } =
            selectionManager.editorToMarkerLayerMap[editor.id];

        view
        .getLayer('highlight-selected-marker-layer')
        .syncToMarkerLayer(visibleMarkerLayer);

        view
        .getLayer('highlight-selected-selected-marker-layer')
        .syncToMarkerLayer(selectedMarkerLayer);
    }


    destroyScrollMarkers ( editor ){

        const { api } = this;

        if( ! api )
            return

        api
        .scrollMarkerViewForEditor(editor)
        .destroy();
    }
}
