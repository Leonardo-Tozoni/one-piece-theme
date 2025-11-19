const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');

const JOLLY_ROGER_URL = 'https://raw.githubusercontent.com/Leonardo-Tozoni/one-piece-theme/main/assets/logotipo.webp';

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('🏴‍☠️ One Piece Theme extension is now active!');

    // Check if already configured
    const config = vscode.workspace.getConfiguration();
    const customCssImports = config.get('vscode_custom_css.imports') || [];
    const alreadyConfigured = customCssImports.some(imp => imp.includes('one-piece-jolly-roger'));

    if (!alreadyConfigured) {
        // Show welcome message with option to enable Jolly Roger
        vscode.window.showInformationMessage(
            '🏴‍☠️ One Piece Theme instalado! Quer adicionar a Jolly Roger dos Piratas do Chapéu de Palha no canto da tela?',
            'Sim, adicionar!',
            'Não, obrigado'
        ).then(selection => {
            if (selection === 'Sim, adicionar!') {
                setupJollyRoger(context);
            }
        });
    }

    // Command to manually enable Jolly Roger
    let enableCommand = vscode.commands.registerCommand('one-piece-theme.enableJollyRoger', function () {
        setupJollyRoger(context);
    });

    // Command to disable Jolly Roger
    let disableCommand = vscode.commands.registerCommand('one-piece-theme.disableJollyRoger', function () {
        disableJollyRoger(context);
    });

    context.subscriptions.push(enableCommand);
    context.subscriptions.push(disableCommand);
}

async function setupJollyRoger(context) {
    try {
        // Check if Custom CSS and JS Loader is installed
        const customCssExtension = vscode.extensions.getExtension('be5invis.vscode-custom-css');
        
        if (!customCssExtension) {
            const install = await vscode.window.showInformationMessage(
                'Para adicionar a Jolly Roger, é necessário instalar a extensão "Custom CSS and JS Loader". Instalar agora?',
                'Sim, instalar',
                'Cancelar'
            );

            if (install === 'Sim, instalar') {
                await vscode.commands.executeCommand('workbench.extensions.installExtension', 'be5invis.vscode-custom-css');
                
                vscode.window.showInformationMessage(
                    'Extensão instalada! Execute o comando novamente: "One Piece: Enable Jolly Roger"',
                    'OK'
                );
            }
            return;
        }

        // Create CSS file
        const cssPath = await createJollyRogerCSS(context);

        // Update VS Code settings
        const config = vscode.workspace.getConfiguration();
        let customCssImports = config.get('vscode_custom_css.imports') || [];
        
        // Remove old import if exists
        customCssImports = customCssImports.filter(imp => !imp.includes('one-piece-jolly-roger'));
        
        // Add new import
        customCssImports.push(`file:///${cssPath.replace(/\\/g, '/')}`);

        await config.update('vscode_custom_css.imports', customCssImports, vscode.ConfigurationTarget.Global);

        // Enable Custom CSS
        const reload = await vscode.window.showInformationMessage(
            '🏴‍☠️ Jolly Roger configurada! Agora você precisa habilitar o Custom CSS e reiniciar o VS Code.',
            'Habilitar e Reiniciar',
            'Depois'
        );

        if (reload === 'Habilitar e Reiniciar') {
            try {
                // Try different command names for Custom CSS
                await vscode.commands.executeCommand('extension.installCustomCSS');
            } catch (err) {
                try {
                    await vscode.commands.executeCommand('extension.updateCustomCSS');
                } catch (err2) {
                    console.log('Custom CSS command executed with potential errors:', err2);
                }
            }
            
            // Small delay to let the command finish
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            await vscode.commands.executeCommand('workbench.action.reloadWindow');
        } else {
            vscode.window.showInformationMessage(
                'Para ver a Jolly Roger: Abra a paleta de comandos (Ctrl+Shift+P) → "Reload Custom CSS and JS" → Reinicie o VS Code'
            );
        }

    } catch (error) {
        vscode.window.showErrorMessage(`Erro ao configurar Jolly Roger: ${error.message}`);
        console.error('Setup error:', error);
    }
}

async function createJollyRogerCSS(context) {
    // Create CSS in user's home directory
    const homeDir = os.homedir();
    const vscodeDir = path.join(homeDir, '.vscode');
    
    // Ensure .vscode directory exists
    if (!fs.existsSync(vscodeDir)) {
        fs.mkdirSync(vscodeDir, { recursive: true });
    }

    const cssPath = path.join(vscodeDir, 'one-piece-jolly-roger.css');

    const cssContent = `
/* One Piece Theme - Jolly Roger Overlay */
/* Auto-generated by One Piece Theme extension */

body::after {
    content: '';
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 150px;
    height: 150px;
    background-image: url('${JOLLY_ROGER_URL}');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    opacity: 0.25;
    pointer-events: none;
    z-index: 999999;
    transition: opacity 0.3s ease, transform 0.3s ease;
}

body:hover::after {
    opacity: 0.4;
    transform: scale(1.05);
}

@media (max-width: 1400px) {
    body::after {
        width: 120px;
        height: 120px;
        bottom: 25px;
        right: 25px;
    }
}

@media (max-width: 1024px) {
    body::after {
        width: 100px;
        height: 100px;
        bottom: 20px;
        right: 20px;
        opacity: 0.2;
    }
}
`;

    fs.writeFileSync(cssPath, cssContent, 'utf-8');
    console.log('CSS file created at:', cssPath);

    return cssPath;
}

async function disableJollyRoger(context) {
    try {
        const config = vscode.workspace.getConfiguration();
        let customCssImports = config.get('vscode_custom_css.imports') || [];
        
        // Remove One Piece import
        customCssImports = customCssImports.filter(imp => !imp.includes('one-piece-jolly-roger'));
        
        await config.update('vscode_custom_css.imports', customCssImports, vscode.ConfigurationTarget.Global);

        // Delete CSS file
        const homeDir = os.homedir();
        const cssPath = path.join(homeDir, '.vscode', 'one-piece-jolly-roger.css');
        
        if (fs.existsSync(cssPath)) {
            fs.unlinkSync(cssPath);
        }

        const reload = await vscode.window.showInformationMessage(
            'Jolly Roger removida! Reinicie o VS Code para aplicar as mudanças.',
            'Reiniciar Agora',
            'Depois'
        );

        if (reload === 'Reiniciar Agora') {
            await vscode.commands.executeCommand('workbench.action.reloadWindow');
        }

    } catch (error) {
        vscode.window.showErrorMessage(`Erro ao remover Jolly Roger: ${error.message}`);
        console.error('Disable error:', error);
    }
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
}
