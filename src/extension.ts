// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from 'path';
import * as vscode from 'vscode';
import * as highlight from './highlight';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.debug('Congratulations, your extension "liber-vscode" is now active!');

	const provider = new highlight.DocumentSemanticTokensProvider();
	context.subscriptions.push(vscode.languages.registerDocumentSemanticTokensProvider(
		highlight.DocumentSemanticTokensProvider.selector, provider, highlight.DocumentSemanticTokensProvider.legend));

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('liber-vscode.runLibrianProject', () => {
		// The code you place here will be executed every time your command is executed
		const docUri = vscode.window.activeTextEditor?.document.uri;
		let workspaceFolder: vscode.WorkspaceFolder | undefined = undefined;
		if (docUri !== undefined) {
			workspaceFolder = vscode.workspace.getWorkspaceFolder(docUri);
		}
		if (workspaceFolder === undefined) {
			if (vscode.workspace.workspaceFolders !== undefined) {
				workspaceFolder = vscode.workspace.workspaceFolders[0];
			}
		}
		const projectPath = workspaceFolder !== undefined ? workspaceFolder.uri.fsPath : path.resolve('.');
		console.debug(`Run Librian project "${projectPath}".`);
		const terminal = vscode.window.createTerminal('Run Librian Project', 'python',
			['-m', 'librian', '--project', projectPath]);
		terminal.show(true);
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
