
const { CompositeDisposable, Emitter } = require('atom');
const { getActiveEditor } = require('./utils/editor-finders');
const SearchModel = require('./search-model');
const debounce = require('debounce');


const { workspace , config } = atom;


module.exports = class SelectionManager {

    editorToMarkerLayerMap = [];
    markerLayer = [];
    resultCount = 0;
    emitter = new Emitter;


    constructor (){

        this.debouncedHandleSelection = this.debouncedHandleSelection.bind(this);

        this.searchModel = new SearchModel(this);

        this.editorSubscriptions = new CompositeDisposable;
        this.editorSubscriptions.add(
            workspace.observeTextEditors(
                (editor) => this.setupMarkerLayers(editor)));

        this.editorSubscriptions.add(
            workspace.onWillDestroyPaneItem((item) => {

                if( item.item.constructor.name !== 'TextEditor' )
                    return

                const editor = item.item;
                this.removeMarkers(editor.id);

                delete this.editorToMarkerLayerMap[editor.id];
            })
        );

        this.enable();
        this.listenForTimeoutChange();

        this.activeItemSubscription = workspace
            .onDidChangeActivePaneItem(() => {
                this.debouncedHandleSelection();
                return this.subscribeToActiveTextEditor();
            });

        this.subscribeToActiveTextEditor();
    }


    destroy (){

        this.handleSelectionDebounce.clear();
        this.activeItemSubscription.dispose();

        this.selectionSubscription?.dispose();
        this.editorSubscriptions?.dispose();
    }

    onDidAddMarker ( callback ){
        const Grim = require('grim'); // eslint-disable-line global-require
        Grim.deprecate('Please do not use. This method will be removed.');
        this.emitter.on('did-add-marker',callback);
    }

    onDidAddSelectedMarker ( callback ){

        const Grim = require('grim');
        Grim.deprecate('Please do not use. This method will be removed.');
        this.emitter.on('did-add-selected-marker',callback);
    }

    onDidAddMarkerForEditor ( callback ){
        this.emitter.on('did-add-marker-for-editor',callback);
    }

    onDidAddSelectedMarkerForEditor ( callback ){
        this.emitter.on('did-add-selected-marker-for-editor',callback);
    }

    onDidFinishAddingMarkers ( callback ){
        this.emitter.on('did-finish-adding-markers',callback);
    }

    onDidRemoveAllMarkers ( callback ){
        this.emitter.on('did-remove-marker-layer',callback);
    }


    disable (){
        this.disabled = true;
        return this.removeAllMarkers()
    }


    enable (){
        this.disabled = false;
        return this.debouncedHandleSelection()
    }


    debouncedHandleSelection (){

        if( ! this.handleSelectionDebounce ){

            this.handleSelectionDebounce = debounce(() => {
                this.searchModel.handleSelection();
            },config.get('highlight-selected.timeout'));
        }

        return this.handleSelectionDebounce()
    }


    listenForTimeoutChange (){
        return config.onDidChange('highlight-selected.timeout',
            () => this.debouncedHandleSelection());
    }


    subscribeToActiveTextEditor (){

        this.selectionSubscription
            ?.dispose();

        const editor = getActiveEditor();

        if( ! editor )
            return

        this.selectionSubscription =
            new CompositeDisposable;

        this.selectionSubscription.add(
            editor.onDidAddSelection(
                this.debouncedHandleSelection));

        this.selectionSubscription.add(
            editor.onDidChangeSelectionRange(
                this.debouncedHandleSelection));

        this.searchModel.handleSelection();
    }


    removeAllMarkers (){

        for ( const editorId in this.editorToMarkerLayerMap )
            this.removeMarkers(editorId);
    }


    removeMarkers ( editorId ){

        const layerMap = this.editorToMarkerLayerMap[ editorId ];

        if( ! layerMap )
            return;

        const { visibleMarkerLayer , selectedMarkerLayer } = layerMap;

        selectedMarkerLayer.clear();
        visibleMarkerLayer.clear();

        this.resultCount = 0;
        this.emitter.emit('did-remove-marker-layer');
    }


    selectAll (){

        const editor = getActiveEditor();
        const markerLayers = this.editorToMarkerLayerMap[editor.id];

        if( ! markerLayers )
            return

        const ranges = [ 'visibleMarkerLayer' , 'selectedMarkerLayer' ]
            .map(( key ) => this.markerLayer[key])
            .map(( layer ) => layer.getMarkers())
            .flat()
            .map(( marker ) => marker.getBufferRange());

        if( ranges.length > 0 )
            editor.setSelectedBufferRanges(ranges,{ flash : true });
    }


    setupMarkerLayers ( editor ){

        const { id } = editor;

        // const layerMap = ( this.editorToMarkerLayerMap[ id ] ??= {} );

        // layerMap.selectedMarkerLayer
        //     ??= editor.addMarkerLayer();

        // layerMap.visibleMarkerLayer
        //     ??= editor.addMarkerLayer();

        const layerMap = this.editorToMarkerLayerMap[ id ] ?? {};

        if( ! layerMap.selectedMarkerLayer )
            layerMap.selectedMarkerLayer = editor.addMarkerLayer();

        if( ! layerMap.visibleMarkerLayer )
            layerMap.visibleMarkerLayer = editor.addMarkerLayer();

        this.editorToMarkerLayerMap[ id ] = layerMap;
    }
};
