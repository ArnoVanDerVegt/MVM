/**
 * Wheel, copyright (c) 2017 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
require('../shared/vm/modules/buttonModuleConstants');
require('../shared/vm/modules/fileModuleConstants');
require('../shared/vm/modules/lightModuleConstants');
require('../shared/vm/modules/mathModuleConstants');
require('../shared/vm/modules/motorModuleConstants');
require('../shared/vm/modules/screenModuleConstants');
require('../shared/vm/modules/sensorModuleConstants');
require('../shared/vm/modules/soundModuleConstants');
require('../shared/vm/modules/standardModuleConstants');
require('../shared/vm/modules/systemModuleConstants');
require('../shared/vm/modules/stringModuleConstants');
require('../shared/vm/modules/bitModuleConstants');
require('../shared/vm/modules/deviceModuleConstants');
require('../shared/vm/modules/multiplexerModuleConstants');
require('../shared/vm/modules/pspModuleConstants');
require('../shared/vm/modules/poweredUpModuleConstants');
require('../shared/vm/modules/components/componentFormModuleConstants');
require('../shared/vm/modules/components/componentButtonModuleConstants');
require('../shared/vm/modules/components/componentCheckboxModuleConstants');
require('../shared/vm/modules/components/componentLabelModuleConstants');
require('../shared/vm/modules/components/componentSelectButtonModuleConstants');
require('../shared/vm/modules/components/componentStatusLightModuleConstants');
require('../shared/vm/modules/components/componentPanelModuleConstants');
require('../shared/vm/modules/components/componentTabsModuleConstants');
require('../shared/vm/modules/components/componentRectangleModuleConstants');
require('../shared/vm/modules/components/componentCircleModuleConstants');
require('../shared/vm/modules/components/componentImageModuleConstants');
require('../shared/vm/modules/components/componentIconModuleConstants');
require('../shared/vm/modules/components/componentTextInputModuleConstants');
require('../shared/vm/modules/components/componentSliderModuleConstants');
require('../shared/vm/modules/components/componentPUDeviceModuleConstants');
require('../shared/vm/modules/components/componentEV3MotorModuleConstants');
require('../shared/vm/modules/components/componentEV3SensorModuleConstants');
require('../shared/vm/modules/components/componentAlertDialogModuleConstants');
require('../shared/vm/modules/components/componentConfirmDialogModuleConstants');
require('../shared/vm/modules/components/componentIntervalModuleConstants');
require('../shared/vm/modules/components/componentTimeoutModuleConstants');
require('../shared/lib/RgfImage');
require('../shared/lib/Sound');
require('../shared/device/BasicDevice');
require('../shared/device/modules/DeviceModule');
require('../shared/device/modules/PoweredUpModule');
require('../shared/device/modules/ButtonModule');
require('../shared/device/modules/FileModule');
require('../shared/device/modules/LightModule');
require('../shared/device/modules/MathModule');
require('../shared/device/modules/MotorModule');
require('../shared/device/modules/ScreenModule');
require('../shared/device/modules/SensorModule');
require('../shared/device/modules/SoundModule');
require('../shared/device/modules/StandardModule');
require('../shared/device/modules/SystemModule');
require('../shared/device/modules/StringModule');
require('../shared/device/modules/BitModule');
require('../shared/device/modules/DeviceModule');
require('../shared/device/modules/PoweredUpModule');
require('../shared/device/ev3/messageEncoder');
require('../shared/device/ev3/CommandQueue');
require('../shared/device/ev3/EV3');
require('../shared/device/ev3/constants');
require('../shared/device/poweredup/PoweredUp');
require('../backend/routes/settings');
require('../backend/routes/ev3');
require('../backend/routes/ide');
require('../frontend/program/Downloader');
const dispatcher = require('../frontend/lib/dispatcher').dispatcher;
require('../frontend/lib/platform');
require('../frontend/lib/Emitter');
require('../frontend/lib/path');
require('../frontend/lib/dom');
require('../frontend/lib/Http');
require('../frontend/program/commands');
require('../frontend/program/Program');
require('../frontend/program/output/Rtf');
require('../frontend/program/output/Text');
require('../frontend/compiler/errors');
require('../frontend/compiler/tokenizer/tokenizer');
require('../frontend/compiler/tokenizer/tokenUtils');
require('../frontend/compiler/tokenizer/TokenIterator');
require('../frontend/compiler/syntax/utils');
require('../frontend/compiler/syntax/syntaxRoot');
require('../frontend/compiler/syntax/syntaxProc');
require('../frontend/compiler/syntax/syntaxProcName');
require('../frontend/compiler/syntax/syntaxProcParams');
require('../frontend/compiler/syntax/syntaxRecord');
require('../frontend/compiler/syntax/syntaxAddr');
require('../frontend/compiler/syntax/syntaxWith');
require('../frontend/compiler/syntax/syntaxSuper');
require('../frontend/compiler/syntax/syntaxModule');
require('../frontend/compiler/syntax/syntaxBreak');
require('../frontend/compiler/syntax/syntaxSelect');
require('../frontend/compiler/syntax/syntaxSelectValue');
require('../frontend/compiler/syntax/syntaxSelectCaseValue');
require('../frontend/compiler/syntax/syntaxSelectDefault');
require('../frontend/compiler/syntax/syntaxForTo');
require('../frontend/compiler/syntax/syntaxForToAssignment');
require('../frontend/compiler/syntax/syntaxNumericAssignment');
require('../frontend/compiler/syntax/syntaxBoolean');
require('../frontend/compiler/syntax/syntaxAssignment');
require('../frontend/compiler/syntax/syntaxBlock');
require('../frontend/compiler/syntax/SyntaxValidator');
require('../frontend/compiler/types/Var');
require('../frontend/compiler/types/Scope');
require('../frontend/compiler/types/Record');
require('../frontend/compiler/types/Objct');
require('../frontend/compiler/types/Proc');
require('../frontend/compiler/types/Namespace');
require('../frontend/compiler/compiler/CompileData');
require('../frontend/compiler/expression/helper');
require('../frontend/compiler/expression/MathExpression');
require('../frontend/compiler/expression/VarExpression');
require('../frontend/compiler/expression/AssignmentExpression');
require('../frontend/compiler/expression/BooleanExpression');
require('../frontend/compiler/compiler/CompileScope');
require('../frontend/compiler/compiler/CompileObjct');
require('../frontend/compiler/compiler/CompileCall');
require('../frontend/compiler/compiler/CompileVars');
require('../frontend/compiler/compiler/CompileBlock');
require('../frontend/compiler/compiler/CompileLoop');
require('../frontend/compiler/compiler/CompileObjct');
require('../frontend/compiler/linter/Linter');
require('../frontend/compiler/resources/ProjectResource');
require('../frontend/compiler/resources/ImageResource');
require('../frontend/compiler/resources/TextResource');
require('../frontend/compiler/resources/FormResource');
require('../frontend/compiler/resources/ProjectResources');
require('../frontend/compiler/preprocessor/Defines');
require('../frontend/compiler/preprocessor/MetaCompiler');
require('../frontend/compiler/preprocessor/PreProcessor');
require('../frontend/compiler/keyword/CompileNamespace');
require('../frontend/compiler/keyword/CompileAddr');
require('../frontend/compiler/keyword/CompileSuper');
require('../frontend/compiler/keyword/CompileBreak');
require('../frontend/compiler/keyword/CompileFor');
require('../frontend/compiler/keyword/CompileIf');
require('../frontend/compiler/keyword/CompileModule');
require('../frontend/compiler/keyword/CompileProc');
require('../frontend/compiler/keyword/CompileRecord');
require('../frontend/compiler/keyword/CompileObjct');
require('../frontend/compiler/keyword/CompileRepeat');
require('../frontend/compiler/keyword/CompileRet');
require('../frontend/compiler/keyword/CompileSelect');
require('../frontend/compiler/keyword/CompileWhile');
require('../frontend/compiler/keyword/CompileWith');
require('../frontend/compiler/CompilerUseInfo');
require('../frontend/compiler/Compiler');
require('../frontend/vm/modules/VMModule');
require('../frontend/vm/modules/VMIDEModule');
require('../frontend/vm/modules/local/FileSystem');
require('../frontend/vm/modules/local/ButtonModule');
require('../frontend/vm/modules/local/FileModule');
require('../frontend/vm/modules/local/LightModule');
require('../frontend/vm/modules/local/MathModule');
require('../frontend/vm/modules/local/MotorModule');
require('../frontend/vm/modules/local/ScreenModule');
require('../frontend/vm/modules/local/SensorModule');
require('../frontend/vm/modules/local/SoundModule');
require('../frontend/vm/modules/local/StandardModule');
require('../frontend/vm/modules/local/SystemModule');
require('../frontend/vm/modules/local/StringModule');
require('../frontend/vm/modules/local/BitModule');
require('../frontend/vm/modules/local/DeviceModule');
require('../frontend/vm/modules/local/PoweredUpModule');
require('../frontend/vm/modules/local/MultiplexerModule');
require('../frontend/vm/modules/local/PspModule');
require('../frontend/vm/modules/local/components/ComponentFormModule');
require('../frontend/vm/modules/local/components/ComponentButtonModule');
require('../frontend/vm/modules/local/components/ComponentCheckboxModule');
require('../frontend/vm/modules/local/components/ComponentLabelModule');
require('../frontend/vm/modules/local/components/ComponentSelectButtonModule');
require('../frontend/vm/modules/local/components/ComponentStatusLightModule');
require('../frontend/vm/modules/local/components/ComponentPanelModule');
require('../frontend/vm/modules/local/components/ComponentTabsModule');
require('../frontend/vm/modules/local/components/ComponentRectangleModule');
require('../frontend/vm/modules/local/components/ComponentCircleModule');
require('../frontend/vm/modules/local/components/ComponentImageModule');
require('../frontend/vm/modules/local/components/ComponentIconModule');
require('../frontend/vm/modules/local/components/ComponentTextInputModule');
require('../frontend/vm/modules/local/components/ComponentSliderModule');
require('../frontend/vm/modules/local/components/ComponentPUDeviceModule');
require('../frontend/vm/modules/local/components/ComponentEV3MotorModule');
require('../frontend/vm/modules/local/components/ComponentEV3SensorModule');
require('../frontend/vm/modules/local/components/ComponentIntervalModule');
require('../frontend/vm/modules/local/components/ComponentTimeoutModule');
require('../frontend/vm/modules/local/components/ComponentAlertDialogModule');
require('../frontend/vm/modules/local/components/ComponentConfirmDialogModule');
require('../frontend/vm/BasicLayerState');
require('../frontend/vm/ev3/LayerState');
require('../frontend/vm/poweredup/LayerState');
require('../frontend/vm/modules/remote/ButtonModule');
require('../frontend/vm/modules/remote/FileModule');
require('../frontend/vm/modules/remote/LightModule');
require('../frontend/vm/modules/remote/MathModule');
require('../frontend/vm/modules/remote/MotorModule');
require('../frontend/vm/modules/remote/ScreenModule');
require('../frontend/vm/modules/remote/SensorModule');
require('../frontend/vm/modules/remote/SoundModule');
require('../frontend/vm/modules/remote/StandardModule');
require('../frontend/vm/modules/remote/SystemModule');
require('../frontend/vm/modules/remote/StringModule');
require('../frontend/vm/modules/remote/BitModule');
require('../frontend/vm/modules/remote/DeviceModule');
require('../frontend/vm/modules/remote/PoweredUpModule');
require('../frontend/vm/modules/remote/MultiplexerModule');
require('../frontend/vm/modules/remote/PspModule');
require('../frontend/vm/VMData');
require('../frontend/vm/VM');
require('../frontend/vm/VMModuleLoader');
require('../frontend/lib/dataprovider/HttpDataProvider');
require('../frontend/lib/dataprovider/ElectronDataProvider');
require('../frontend/lib/dataprovider/dataProvider');
require('../frontend/lib/components/component/componentStyle');
require('../frontend/lib/components/component/Component');
require('../frontend/lib/components/component/ComponentContainer');
require('../frontend/lib/components/ContextMenu');
require('../frontend/lib/components/TabPanel');
require('../frontend/lib/components/Panel');
require('../frontend/lib/components/Dialog');
require('../frontend/lib/components/Menu');
require('../frontend/lib/components/Resizer');
require('../frontend/lib/components/CheckboxAndLabel');
require('../frontend/lib/components/Toolbar');
require('../frontend/lib/components/Hint');
require('../frontend/lib/components/WizardSteps');
require('../frontend/lib/components/IncludeFiles');
require('../frontend/lib/components/mainmenu/MainMenuItem');
require('../frontend/lib/components/mainmenu/MainMenu');
require('../frontend/lib/components/input/IconSelect');
require('../frontend/lib/components/input/Tabs');
require('../frontend/lib/components/input/Button');
require('../frontend/lib/components/input/Dropdown');
require('../frontend/lib/components/input/CloseButton');
require('../frontend/lib/components/input/TextArea');
require('../frontend/lib/components/input/TextInput');
require('../frontend/lib/components/input/Checkbox');
require('../frontend/lib/components/input/Radio');
require('../frontend/lib/components/input/Slider');
require('../frontend/lib/components/input/ToolOptions');
require('../frontend/lib/components/status/LoadingDots');
require('../frontend/lib/components/status/ProgressBar');
require('../frontend/lib/components/status/StatusLight');
require('../frontend/lib/components/text/Title');
require('../frontend/lib/components/text/Text');
require('../frontend/lib/components/text/ListItems');
require('../frontend/lib/components/text/Label');
require('../frontend/lib/components/nonvisual/NonVisualComponent');
require('../frontend/lib/components/nonvisual/Interval');
require('../frontend/lib/components/nonvisual/Timeout');
require('../frontend/lib/components/nonvisual/AlertDialog');
require('../frontend/lib/components/nonvisual/ConfirmDialog');
require('../frontend/lib/components/io/BasicIODevice');
require('../frontend/lib/components/io/PoweredUpDevice');
require('../frontend/lib/components/io/EV3Motor');
require('../frontend/lib/components/io/EV3Sensor');
require('../frontend/lib/components/files/File');
require('../frontend/lib/components/files/FileDetail');
require('../frontend/lib/components/files/Files');
require('../frontend/lib/components/filetree/Item');
require('../frontend/lib/components/filetree/File');
require('../frontend/lib/components/filetree/Directory');
require('../frontend/lib/components/filetree/FileTree');
require('../frontend/lib/components/tree/TreeNode');
require('../frontend/lib/components/tree/Tree');
require('../frontend/lib/components/list/ListItem');
require('../frontend/lib/components/list/List');
require('../frontend/lib/components/basic/A');
require('../frontend/lib/components/basic/Span');
require('../frontend/lib/components/basic/H');
require('../frontend/lib/components/basic/P');
require('../frontend/lib/components/basic/Hr');
require('../frontend/lib/components/basic/Pre');
require('../frontend/lib/components/basic/Table');
require('../frontend/lib/components/basic/Ul');
require('../frontend/lib/components/basic/Img');
require('../frontend/lib/components/graphics/Rectangle');
require('../frontend/lib/components/graphics/Circle');
require('../frontend/lib/components/graphics/Image');
require('../frontend/lib/components/graphics/Icon');
require('../frontend/lib/directoryWatcher');
require('../frontend/lib/fileDropHandler');
require('../frontend/ide/data/images');
// Don't load, only loaded in setup when needed: require('../frontend/ide/data/templates');
require('../frontend/ide/data/texts');
require('../frontend/ide/tabIndex');
require('../frontend/ide/plugins/pluginUuid');
require('../frontend/ide/help/components/IndexList');
require('../frontend/ide/help/components/IndexListText');
require('../frontend/ide/help/woc/FileProcessor');
require('../frontend/ide/help/woc/SubjectFileProcessor');
require('../frontend/ide/help/woc/WhlFileProcessor');
require('../frontend/ide/help/woc/WocFileProcessor');
require('../frontend/ide/help/woc/Woc');
require('../frontend/ide/help/woc/wheelSyntaxTokens');
require('../frontend/ide/help/woc/SyntaxOutput');
require('../frontend/ide/help/woc/SyntaxOutputHTML');
require('../frontend/ide/help/woc/SyntaxOutputSVG');
require('../frontend/ide/help/woc/WheelSyntax');
require('../frontend/ide/help/helpData');
require('../frontend/ide/help/HelpBuilder');
require('../frontend/ide/help/HelpBuilderText');
require('../frontend/ide/editor/editors/form/ContainerIdsForForm');
require('../frontend/ide/dialogs/AlertDialog');
require('../frontend/ide/dialogs/settings/components/Updater');
require('../frontend/ide/dialogs/settings/components/ExportSettings');
require('../frontend/ide/dialogs/settings/components/CheckboxSetting');
require('../frontend/ide/dialogs/settings/components/IncludeFilesSetting');
require('../frontend/ide/dialogs/settings/components/ImageOpenSettings');
require('../frontend/ide/dialogs/settings/components/TextInputSetting');
require('../frontend/ide/dialogs/settings/components/TextAreaSetting');
require('../frontend/ide/dialogs/settings/tabs/addVersionTab');
require('../frontend/ide/dialogs/settings/tabs/addExportTab');
require('../frontend/ide/dialogs/settings/tabs/addEditorTab');
require('../frontend/ide/dialogs/settings/tabs/addCompilerTab');
require('../frontend/ide/dialogs/settings/tabs/addViewTab');
require('../frontend/ide/dialogs/settings/tabs/addConsoleTab');
require('../frontend/ide/dialogs/settings/tabs/addSimulatorTab');
require('../frontend/ide/dialogs/settings/SettingsDialog');
require('../frontend/ide/dialogs/hint/HintDialog');
require('../frontend/ide/dialogs/hint/OpenFormDialog');
require('../frontend/ide/dialogs/hint/ConnectedDialog');
require('../frontend/ide/dialogs/ConfirmDialog');
require('../frontend/ide/dialogs/ExploreDialog');
require('../frontend/ide/dialogs/list/components/ListItem');
require('../frontend/ide/dialogs/list/components/AutoConnectListItem');
require('../frontend/ide/dialogs/list/ListDialog');
require('../frontend/ide/dialogs/list/EV3ConnectListDialog');
require('../frontend/ide/dialogs/list/PoweredUpConnectListDialog');
require('../frontend/ide/dialogs/list/PoweredUpAutoConnectListDialog');
require('../frontend/ide/dialogs/statistics/StatisticsDialog');
require('../frontend/ide/dialogs/YesNoCancelDialog');
require('../frontend/ide/dialogs/file/state/DeviceListState');
require('../frontend/ide/dialogs/file/components/Step');
require('../frontend/ide/dialogs/file/components/PoweredUpDeviceItem');
require('../frontend/ide/dialogs/file/components/PoweredUpDeviceList');
require('../frontend/ide/dialogs/file/components/PoweredUpStep1Start');
require('../frontend/ide/dialogs/file/components/PoweredUpStep2Device');
require('../frontend/ide/dialogs/file/components/PoweredUpStep3Ports');
require('../frontend/ide/dialogs/file/components/PoweredUpStep4Include');
require('../frontend/ide/dialogs/file/components/PoweredUpStep5Form');
require('../frontend/ide/dialogs/file/components/PoweredUpStep6Finish');
require('../frontend/ide/dialogs/file/FileDialog');
require('../frontend/ide/dialogs/file/FileOpenDialog');
require('../frontend/ide/dialogs/file/FileNewDialog');
require('../frontend/ide/dialogs/file/FileRenameDialog');
require('../frontend/ide/dialogs/file/FilePoweredUpProjectDialog');
require('../frontend/ide/dialogs/image/components/ImagePreview');
require('../frontend/ide/dialogs/image/components/Step');
require('../frontend/ide/dialogs/image/components/StepSelect');
require('../frontend/ide/dialogs/image/components/StepScale');
require('../frontend/ide/dialogs/image/components/StepContrast');
require('../frontend/ide/dialogs/image/components/StepFilename');
require('../frontend/ide/dialogs/image/ImageDialog');
require('../frontend/ide/dialogs/image/ImageNewDialog');
require('../frontend/ide/dialogs/image/ImageResizeDialog');
require('../frontend/ide/dialogs/image/ImageLoadDialog');
require('../frontend/ide/dialogs/image/IconDialog');
require('../frontend/ide/dialogs/form/ComponentFormContainer.js');
require('../frontend/ide/dialogs/form/FormSizeDialog');
require('../frontend/ide/dialogs/form/FormNewDialog');
require('../frontend/ide/dialogs/form/FormDialog');
require('../frontend/ide/dialogs/form/FormGridSizeDialog');
require('../frontend/ide/dialogs/VolumeDialog');
require('../frontend/ide/dialogs/help/components/WocFileLoader');
require('../frontend/ide/dialogs/help/HelpDialog');
require('../frontend/ide/dialogs/directcontrol/components/Motor');
require('../frontend/ide/dialogs/directcontrol/components/MotorAlias');
require('../frontend/ide/dialogs/directcontrol/components/Motors');
require('../frontend/ide/dialogs/directcontrol/components/PianoKey');
require('../frontend/ide/dialogs/directcontrol/components/Piano');
require('../frontend/ide/dialogs/directcontrol/DirectControlDialog');
require('../frontend/ide/dialogs/directcontrol/EV3ControlDialog');
require('../frontend/ide/dialogs/directcontrol/PoweredUpControlDialog');
require('../frontend/ide/dialogs/DaisyChainDialog');
require('../frontend/ide/dialogs/LicenseDialog');
require('../frontend/ide/dialogs/directory/DirectoryNewDialog');
require('../frontend/ide/dialogs/find/FindDialog');
require('../frontend/ide/dialogs/find/FindInFilesDialog');
require('../frontend/ide/dialogs/find/ReplaceDialog');
require('../frontend/ide/dialogs/download/components/ResourceLine');
require('../frontend/ide/dialogs/download/DownloadDialog');
require('../frontend/ide/dialogs/GraphDialog');
require('../frontend/ide/dialogs/device/DeviceAliasDialog');
require('../frontend/ide/dialogs/device/DevicePortAliasDialog');
require('../frontend/ide/dialogs/device/DeviceCountDialog');
require('../frontend/ide/dialogs/tools/components/GearSettings');
require('../frontend/ide/dialogs/tools/components/GearList');
require('../frontend/ide/dialogs/tools/components/GearResult');
require('../frontend/ide/dialogs/tools/GearRatioCalculatorDialog');
require('../frontend/ide/dialogs/tools/InverseKinematicsDialog');
require('../frontend/ide/menu/HelpOption');
require('../frontend/ide/menu/MainMenu');
require('../frontend/ide/editor/editors/Clipboard');
require('../frontend/ide/editor/editors/Editor');
require('../frontend/ide/editor/editors/home/HomeScreenTile');
require('../frontend/ide/editor/editors/home/HomeScreenConnectEV3Tile');
require('../frontend/ide/editor/editors/home/HomeScreenConnectPoweredUpTile');
require('../frontend/ide/editor/editors/home/HomeScreenRecentProjectTile');
require('../frontend/ide/editor/editors/home/HomeScreenThemeTile');
require('../frontend/ide/editor/editors/home/HomeScreenNewProjectTile');
require('../frontend/ide/editor/editors/home/HomeScreen');
require('../frontend/ide/editor/editors/text/toolbar/BluetoothState');
require('../frontend/ide/editor/editors/text/toolbar/ToolbarBottom');
require('../frontend/ide/editor/editors/text/toolbar/ToolbarBottomViewer');
require('../frontend/ide/editor/editors/text/VMViewer');
require('../frontend/ide/editor/editors/text/WheelEditorState');
require('../frontend/ide/editor/editors/text/WheelEditor');
require('../frontend/ide/editor/editors/text/TextEditor');
require('../frontend/ide/editor/editors/image/text/Text');
require('../frontend/ide/editor/editors/image/text/TextLarge');
require('../frontend/ide/editor/editors/image/text/TextMedium');
require('../frontend/ide/editor/editors/image/text/TextSmall');
require('../frontend/ide/editor/editors/image/toolbar/ToolbarTop');
require('../frontend/ide/editor/editors/image/toolbar/ToolbarBottom');
require('../frontend/ide/editor/editors/image/Image');
require('../frontend/ide/editor/editors/image/Grid');
require('../frontend/ide/editor/editors/image/selection/Selection');
require('../frontend/ide/editor/editors/image/selection/SelectionCopy');
require('../frontend/ide/editor/editors/image/selection/SelectionText');
require('../frontend/ide/editor/editors/image/ImageLoader');
require('../frontend/ide/editor/editors/image/ImageEditorState');
require('../frontend/ide/editor/editors/image/ImageEditor');
require('../frontend/ide/editor/editors/sound/toolbar/ToolbarTop');
require('../frontend/ide/editor/editors/sound/toolbar/ToolbarBottom');
require('../frontend/ide/editor/editors/sound/SoundLoader');
require('../frontend/ide/editor/editors/sound/SoundEditorState');
require('../frontend/ide/editor/editors/sound/SoundEditor');
require('../frontend/ide/editor/editors/form/toolbar/ToolbarTop');
require('../frontend/ide/editor/editors/form/toolbar/ToolbarBottom');
require('../frontend/ide/source/sourceBuilderUtils');
require('../frontend/ide/source/SourceBuilder');
require('../frontend/ide/source/SourceFormatter');
require('../frontend/ide/editor/editors/form/ComponentBuilder');
require('../frontend/ide/editor/editors/form/formEditorConstants');
require('../frontend/ide/editor/editors/form/FormComponentContainer');
require('../frontend/ide/editor/editors/form/FormComponent');
require('../frontend/ide/editor/editors/form/state/ComponentList');
require('../frontend/ide/editor/editors/form/state/EventList');
require('../frontend/ide/editor/editors/form/state/PropertyList');
require('../frontend/ide/editor/editors/form/state/UndoStack');
require('../frontend/ide/editor/editors/form/state/FormEditorToolbarState');
require('../frontend/ide/editor/editors/form/state/FormEditorState');
require('../frontend/ide/editor/editors/form/FormEditor');
require('../frontend/ide/editor/editors/imageviewer/toolbar/ToolbarTop');
require('../frontend/ide/editor/editors/imageviewer/toolbar/ToolbarBottom');
require('../frontend/ide/editor/editors/imageviewer/ImageViewer');
require('../frontend/ide/editor/Editors');
require('../frontend/ide/editor/EditorsState');
require('../frontend/ide/editor/Editor');
require('../frontend/ide/console/spans');
require('../frontend/ide/console/components/VarView');
require('../frontend/ide/console/components/VarViewNumber');
require('../frontend/ide/console/components/VarViewString');
require('../frontend/ide/console/components/VarViewRecord');
require('../frontend/ide/console/tree/ArrayTreeBuilder');
require('../frontend/ide/console/tree/RecordTreeBuilder');
require('../frontend/ide/console/Vars');
require('../frontend/ide/console/Registers');
require('../frontend/ide/console/Log');
require('../frontend/ide/console/Terminal');
require('../frontend/ide/console/NewVersion');
require('../frontend/ide/console/Console');
require('../frontend/ide/properties/PropertiesToolbar');
require('../frontend/ide/properties/components/Container');
require('../frontend/ide/properties/components/Form');
require('../frontend/ide/properties/components/Property');
require('../frontend/ide/properties/components/Properties');
require('../frontend/ide/properties/components/Event');
require('../frontend/ide/properties/components/Events');
require('../frontend/ide/properties/components/types/BooleanProperty');
require('../frontend/ide/properties/components/types/DropdownProperty');
require('../frontend/ide/properties/components/types/HAlignProperty');
require('../frontend/ide/properties/components/types/ColorProperty');
require('../frontend/ide/properties/components/types/TextProperty');
require('../frontend/ide/properties/components/types/TextAreaProperty');
require('../frontend/ide/properties/components/types/TextListProperty');
require('../frontend/ide/properties/components/types/RgbProperty');
require('../frontend/ide/properties/components/types/IconProperty');
require('../frontend/ide/properties/components/Components');
require('../frontend/ide/properties/Properties');
require('../frontend/ide/simulator/SimulatorToolbar');
require('../frontend/ide/simulator/SimulatorModules');
require('../frontend/ide/plugins/simulator/lib/SimulatorPlugin');
require('../frontend/ide/plugins/simulator/lib/motor/io/BasicIOState');
require('../frontend/ide/plugins/simulator/lib/motor/io/BasicIODevice');
require('../frontend/ide/plugins/simulator/lib/motor/io/Motor');
require('../frontend/ide/plugins/simulator/lib/motor/Plugin');
require('../frontend/ide/plugins/simulator/ev3/io/text/Text');
require('../frontend/ide/plugins/simulator/ev3/io/text/TextLarge');
require('../frontend/ide/plugins/simulator/ev3/io/text/TextMedium');
require('../frontend/ide/plugins/simulator/ev3/io/text/TextSmall');
require('../frontend/ide/plugins/simulator/ev3/io/Light');
require('../frontend/ide/plugins/simulator/ev3/io/Sound');
require('../frontend/ide/plugins/simulator/ev3/io/Button');
require('../frontend/ide/plugins/simulator/ev3/io/Buttons');
require('../frontend/ide/plugins/simulator/ev3/io/Display');
require('../frontend/ide/plugins/simulator/ev3/Plugin');
require('../frontend/ide/plugins/simulator/ev3motors/io/MotorState');
require('../frontend/ide/plugins/simulator/ev3motors/io/Motor');
require('../frontend/ide/plugins/simulator/ev3motors/Plugin');
require('../frontend/ide/plugins/simulator/ev3sensors/io/Sensor');
require('../frontend/ide/plugins/simulator/ev3sensors/io/UnknownSensor');
require('../frontend/ide/plugins/simulator/ev3sensors/io/ColorSensor');
require('../frontend/ide/plugins/simulator/ev3sensors/io/GyroSensor');
require('../frontend/ide/plugins/simulator/ev3sensors/io/InfraredSensor');
require('../frontend/ide/plugins/simulator/ev3sensors/io/SoundSensor');
require('../frontend/ide/plugins/simulator/ev3sensors/io/TouchSensor');
require('../frontend/ide/plugins/simulator/ev3sensors/io/UltrasonicSensor');
require('../frontend/ide/plugins/simulator/ev3sensors/io/MultiplexerSensor');
require('../frontend/ide/plugins/simulator/ev3sensors/SensorContainer');
require('../frontend/ide/plugins/simulator/ev3sensors/Plugin');
require('../frontend/ide/plugins/simulator/psp/Plugin');
require('../frontend/ide/plugins/simulator/poweredup/io/MotorOrSensorState');
require('../frontend/ide/plugins/simulator/poweredup/io/MotorOrSensor');
require('../frontend/ide/plugins/simulator/poweredup/io/SimulatedLayerDevice');
require('../frontend/ide/plugins/simulator/poweredup/io/SimulatedDevices');
require('../frontend/ide/plugins/simulator/poweredup/components/BasicHub');
require('../frontend/ide/plugins/simulator/poweredup/components/TechnicHub');
require('../frontend/ide/plugins/simulator/poweredup/components/Hub');
require('../frontend/ide/plugins/simulator/poweredup/components/MoveHub');
require('../frontend/ide/plugins/simulator/poweredup/components/Remote');
require('../frontend/ide/plugins/simulator/poweredup/Plugin');
require('../frontend/ide/plugins/simulator/graph/io/CircularBuffer');
require('../frontend/ide/plugins/simulator/graph/io/BarChartDrawer');
require('../frontend/ide/plugins/simulator/graph/io/BinaryChartDrawer');
require('../frontend/ide/plugins/simulator/graph/io/ColorBarChartDrawer');
require('../frontend/ide/plugins/simulator/graph/io/FillChartDrawer');
require('../frontend/ide/plugins/simulator/graph/io/LineChartDrawer');
require('../frontend/ide/plugins/simulator/graph/io/PointChartDrawer');
require('../frontend/ide/plugins/simulator/graph/io/SplineChartDrawer');
require('../frontend/ide/plugins/simulator/graph/io/ChartDrawer');
require('../frontend/ide/plugins/simulator/graph/Plugin');
require('../frontend/ide/simulator/Simulator');
require('../frontend/ide/CompileAndRun');
require('../frontend/ide/CompileAndRunOutput');
require('../frontend/ide/CompileAndRunInstall');
require('../frontend/ide/IDEEvents');
require('../frontend/ide/IDEDialogs');
require('../frontend/ide/IDEDOM');
require('../frontend/ide/settings/PluginsState');
require('../frontend/ide/settings/IncludeFilesState');
require('../frontend/ide/settings/PoweredUpAutoConnectState');
require('../frontend/vm/BasicDeviceState');
require('../frontend/ide/IDEAssistant');
const Setup          = require('../frontend/ide/Setup').Setup;
const IDE            = require('../frontend/ide/IDE').IDE;
const SettingsState  = require('../frontend/ide/settings/SettingsState').SettingsState;
const UIState        = require('../frontend/lib/UIState').UIState;
const EV3State       = require('../frontend/vm/ev3/EV3State').EV3State;
const PoweredUpState = require('../frontend/vm/poweredup/PoweredUpState').PoweredUpState;

(function() {
    let settings;
    let ui;
    let ide   = null;
    let setup = null;

    const onFinishedSetup = function() {
            if (ide) {
                return;
            }
            ide = new IDE({
                ui:        ui,
                settings:  settings,
                ev3:       new EV3State({layerCount: settings.getDaisyChainMode()}),
                poweredUp: new PoweredUpState({layerCount: settings.getDaisyChainMode()})
            });
        };

    const onLoadedSettings = function() {
            if (setup) {
                return;
            }
            require('../frontend/lib/path').setSep(settings.getOS().pathSep);
            setup = new Setup({
                ui:         ui,
                settings:   settings,
                onFinished: onFinishedSetup
            });
        };

    const loadDocumentPath = function() {
            const ipcRenderer = require('electron').ipcRenderer;
            ipcRenderer.on(
                'postMessage',
                function(event, arg) {
                    let data;
                    try {
                        data = JSON.parse(arg);
                    } catch (error) {
                        data = {};
                    }
                    if (data.message === 'documentPath') {
                        const getDataProvider = require('../frontend/lib/dataprovider/dataProvider').getDataProvider;
                        ui       = new UIState();
                        settings = new SettingsState({
                            getDataProvider:    getDataProvider,
                            systemDocumentPath: data.data,
                            isPackaged:         data.isPackaged
                        });
                        settings.load(onLoadedSettings);
                    }
                }
            );
            ipcRenderer.send('postMessage', {command: 'documentPath'});
        };

    const onDOMContentLoaded = function() {
            loadDocumentPath();
        };

    document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
})();
