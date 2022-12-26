
const { workspace } = atom;


function getActiveEditor (){
    return workspace.getActiveTextEditor();
}


const isTextEditor = ( item ) =>
    item?.constructor.name === 'TextEditor';


function getActiveEditors (){
    return workspace
        .getPanes()
        .map(({ activeItem }) => activeItem)
        .filter(isTextEditor)
}



module.exports = { getActiveEditor , getActiveEditors }
