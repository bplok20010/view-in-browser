'use strict';

import * as vscode from 'vscode';
import * as path from 'path';

const open = require('open');
const open_darwin = require('mac-open');

// decide what os should be used
// possible node values 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
const platform = process.platform;

// open file in custom browser
function openInSpecificPlatform(e: string, op: any, customBrowser: string) {
    customBrowser ? op(e, customBrowser) : op(e);
}

// common function for file opening
function openFile(e: string, customBrowser: string, baseUri:string) {
    // check if it is html file
    const ext = path.extname(e.toString());
    const basename = path.basename(e.toString());
    if (/^\.(html|htm|shtml|xhtml|php|jsp|asp|aspx)$/.test(ext)) {
        // platform is operational system
        // darwin - mac os, others are good with open npm module
        if (platform === 'darwin') {
            openInSpecificPlatform(baseUri + '/' + basename, open_darwin, customBrowser);
        }
        else {
            openInSpecificPlatform(baseUri + '/' + basename, open, customBrowser);
        }
    } else {
        vscode.window.showInformationMessage('Current file cannot be previewed!');
    }
}

// main code of the extension
export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.previewInBrowser', (e: vscode.Uri) => {
        let config = vscode.workspace.getConfiguration('preview-in-browser');
        let customBrowser = config.get<string>("customBrowser");
        let baseUri = config.get<string>("baseUri");

        // if there is Uri it means the file was selected in the explorer.
        if (e.path) {
            openFile(e.fsPath, customBrowser, baseUri);
        }
        else {
            let editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('No active text editor found!');
                return;
            }

            const file = editor.document.fileName;
            openFile(`file:///${file}`, customBrowser, baseUri);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}