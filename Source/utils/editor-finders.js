
const { workspace } = atom;


function getActiveEditor (){
    return workspace.getActiveTextEditor();
}

function getActiveEditors (){
    return workspace
        .getPanes()
        .map((pane) => {

            const { activeItem } = pane;

            const { name } = activeItem?.constructor ?? {};

            if( name === 'TextEditor' )
                return activeItem
        })
}



module.exports = { getActiveEditor , getActiveEditors }
