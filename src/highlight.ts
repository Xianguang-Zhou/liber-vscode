import * as vscode from 'vscode';
import * as liber from './parser';

export class DocumentSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {

    private static readonly nodeTypeToTokenType: liber.Dict<string> = {
        'functionCalling': 'type',
        'embeddedCode': 'regexp',
        'characterOperation': 'enumMember',
        'insertedImage': 'function',
        'characterDialog': 'parameter',
        'characterExpression': 'property',
        'scene': 'string',
        'option': 'keyword',
        'comment': 'comment',
        'aside': 'label',
        'jumpPoint': 'macro'
    };
    private static readonly tokenTypes = Object.values(DocumentSemanticTokensProvider.nodeTypeToTokenType);
    private static readonly tokenModifiers: string[] = [];
    public static readonly legend = new vscode.SemanticTokensLegend(
        DocumentSemanticTokensProvider.tokenTypes, DocumentSemanticTokensProvider.tokenModifiers);

    private static readonly parser = new liber.Parser();

    public static readonly selector = [
        { language: 'liber', scheme: 'file' },
        { language: 'liber', scheme: 'untitled' }
    ]; // register for all Liber documents

    public provideDocumentSemanticTokens(
        document: vscode.TextDocument
    ): vscode.ProviderResult<vscode.SemanticTokens> {
        // analyze the document and return semantic tokens
        try {
            const [nodes, lines] = DocumentSemanticTokensProvider.parser.parse(document.getText());
            const tokensBuilder = new vscode.SemanticTokensBuilder(DocumentSemanticTokensProvider.legend);
            nodes.forEach(node => {
                const tokenType = DocumentSemanticTokensProvider.nodeTypeToTokenType[node['type'] as string];
                const nodeRange = node['range'] as liber.Range;
                let currentLine = nodeRange.begin.line;
                if (currentLine < nodeRange.end.line) {
                    tokensBuilder.push(
                        new vscode.Range(
                            new vscode.Position(currentLine, nodeRange.begin.column),
                            new vscode.Position(currentLine, lines[currentLine].length)
                        ),
                        tokenType,
                        []
                    );
                    ++currentLine;

                    while (currentLine < nodeRange.end.line) {
                        tokensBuilder.push(
                            new vscode.Range(
                                new vscode.Position(currentLine, 0),
                                new vscode.Position(currentLine, lines[currentLine].length)
                            ),
                            tokenType,
                            []
                        );
                        ++currentLine;
                    }

                    tokensBuilder.push(
                        new vscode.Range(
                            new vscode.Position(currentLine, 0),
                            new vscode.Position(currentLine, nodeRange.end.column)
                        ),
                        tokenType,
                        []
                    );
                } else {
                    tokensBuilder.push(
                        new vscode.Range(
                            new vscode.Position(currentLine, nodeRange.begin.column),
                            new vscode.Position(currentLine, nodeRange.end.column)
                        ),
                        tokenType,
                        []
                    );
                }
            });
            return tokensBuilder.build();
        } catch (error) {
            console.debug(error);
            throw new Error('Busy');
        }
    }
}