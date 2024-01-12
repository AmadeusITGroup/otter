/* eslint-disable @typescript-eslint/naming-convention */
import type { ImportsMapping } from '../../utility';

/** Packages that were renamed */
export const renamedPackagesV7toV8: { [key: string]: string } = {
  '@otter/mobile': '@o3r/mobile',
  '@otter/storybook': '@o3r/storybook',
  '@otter/third-party': '@o3r/third-party',
  '@otter/testing': '@o3r/testing',
  '@otter/chrome-devtools': '@o3r/chrome-devtools',
  '@otter/customization': '@o3r/customization',
  '@otter/eslint-config-otter': '@o3r/eslint-config-otter',
  '@otter/eslint-plugin': '@o3r/eslint-plugin',
  '@otter/stylelint-plugin': '@o3r/stylelint-plugin',
  '@otter/vscode-extension': '@o3r/vscode-extension',
  '@otter/web-components': '@o3r/web-components',
  '@otter/dev-tools': '@o3r/dev-tools'
};

/** Map containing the import changes in otter packages for the exported elements */
export const mapImportV7toV8: ImportsMapping = {
  '@otter/common': {
    PlaceholderComponent: {
      newPackage: '@o3r/components'
    },
    PlaceholderModule: {
      newPackage: '@o3r/components'
    },
    Category: {
      newPackage: '@o3r/analytics'
    },
    EventInfo: {
      newPackage: '@o3r/analytics'
    },
    Attribute: {
      newPackage: '@o3r/analytics'
    },
    EventContext: {
      newPackage: '@o3r/analytics'
    },
    AnalyticsEvent: {
      newPackage: '@o3r/analytics'
    },
    ConstructorAnalyticsEvent: {
      newPackage: '@o3r/analytics'
    },
    ConstructorAnalyticsEventParameters: {
      newPackage: '@o3r/analytics'
    },
    AnalyticsEvents: {
      newPackage: '@o3r/analytics'
    },
    Trackable: {
      newPackage: '@o3r/analytics'
    },
    UiEventPayload: {
      newPackage: '@o3r/analytics'
    },
    CustomEventPayload: {
      newPackage: '@o3r/analytics'
    },
    TrackEventName: {
      newPackage: '@o3r/analytics'
    },
    EventTiming: {
      newPackage: '@o3r/analytics'
    },
    PerceivedEvents: {
      newPackage: '@o3r/analytics'
    },
    ServerCallMetric: {
      newPackage: '@o3r/analytics'
    },
    CustomEventMarks: {
      newPackage: '@o3r/analytics'
    },
    FirstLoadDataPayload: {
      newPackage: '@o3r/analytics'
    },
    PerfEventPayload: {
      newPackage: '@o3r/analytics'
    },
    TrackClickDirective: {
      newPackage: '@o3r/analytics'
    },
    TrackFocusDirective: {
      newPackage: '@o3r/analytics'
    },
    BaseTrackEvents: {
      newPackage: '@o3r/analytics'
    },
    TrackEventsDirective: {
      newPackage: '@o3r/analytics'
    },
    TrackEventsModule: {
      newPackage: '@o3r/analytics'
    },
    TrackActive: {
      newPackage: '@o3r/analytics'
    },
    EventTrackConfiguration: {
      newPackage: '@o3r/analytics'
    },
    defaultEventTrackConfiguration: {
      newPackage: '@o3r/analytics'
    },
    EVENT_TRACK_SERVICE_CONFIGURATION: {
      newPackage: '@o3r/analytics'
    },
    performanceMarksInitialState: {
      newPackage: '@o3r/analytics'
    },
    EventTrackService: {
      newPackage: '@o3r/analytics'
    },
    ApiClassType: {
      newPackage: '@o3r/apis-manager'
    },
    INITIAL_APIS_TOKEN: {
      newPackage: '@o3r/apis-manager'
    },
    ApiFactoryService: {
      newPackage: '@o3r/apis-manager'
    },
    INTERNAL_API_TOKEN: {
      newPackage: '@o3r/apis-manager'
    },
    API_TOKEN: {
      newPackage: '@o3r/apis-manager'
    },
    defaultConfig: {
      newPackage: '@o3r/apis-manager'
    },
    ApiManagerModule: {
      newPackage: '@o3r/apis-manager'
    },
    C11nDirective: {
      newPackage: '@o3r/components'
    },
    EntryCustomComponents: {
      newPackage: '@o3r/components'
    },
    registerCustomComponent: {
      newPackage: '@o3r/components'
    },
    MockC11nDirective: {
      newPackage: '@o3r/components'
    },
    C11nMockService: {
      newPackage: '@o3r/components'
    },
    C11nMockModule: {
      newPackage: '@o3r/components'
    },
    createC11nService: {
      newPackage: '@o3r/components'
    },
    C11nModule: {
      newPackage: '@o3r/components'
    },
    C11nService: {
      newPackage: '@o3r/components'
    },
    C11N_PRESENTERS_MAP_TOKEN: {
      newPackage: '@o3r/components'
    },
    C11N_REGISTER_FUNC_TOKEN: {
      newPackage: '@o3r/components'
    },
    getDynamicContent: {
      newPackage: '@o3r/dynamic-content'
    },
    getCmsAssets: {
      newPackage: '@o3r/dynamic-content'
    },
    DynamicContentModule: {
      newPackage: '@o3r/dynamic-content'
    },
    DynamicContentPipe: {
      newPackage: '@o3r/dynamic-content'
    },
    DynamicContentService: {
      newPackage: '@o3r/dynamic-content'
    },
    DYNAMIC_CONTENT_BASE_PATH_TOKEN: {
      newPackage: '@o3r/dynamic-content'
    },
    CMS_ASSETS_PATH_TOKEN: {
      newPackage: '@o3r/dynamic-content'
    },
    CustomErrors: {
      newPackage: '@o3r/forms'
    },
    CustomValidationFn: {
      newPackage: '@o3r/forms'
    },
    AsyncCustomValidationFn: {
      newPackage: '@o3r/forms'
    },
    CustomFieldsValidation: {
      newPackage: '@o3r/forms'
    },
    AsyncCustomFieldsValidation: {
      newPackage: '@o3r/forms'
    },
    CustomFormValidation: {
      newPackage: '@o3r/forms'
    },
    AsyncCustomFormValidation: {
      newPackage: '@o3r/forms'
    },
    ExtendedValidator: {
      newPackage: '@o3r/forms'
    },
    FlatError: {
      newPackage: '@o3r/forms'
    },
    ControlFlatErrors: {
      newPackage: '@o3r/forms'
    },
    isFormGroup: {
      newPackage: '@o3r/forms'
    },
    markAllControlsDirtyAndTouched: {
      newPackage: '@o3r/forms'
    },
    markAllControlsPristineAndUntouched: {
      newPackage: '@o3r/forms'
    },
    getFlatControlErrors: {
      newPackage: '@o3r/forms'
    },
    Submittable: {
      newPackage: '@o3r/forms'
    },
    LocalizationTranslateDirective: {
      newPackage: '@o3r/localization'
    },
    LocalizationTranslatePipe: {
      newPackage: '@o3r/localization'
    },
    createLocalizationConfiguration: {
      newPackage: '@o3r/localization'
    },
    TranslateMessageFormatLazyCompiler: {
      newPackage: '@o3r/localization'
    },
    localeIdNgBridge: {
      newPackage: '@o3r/localization'
    },
    CUSTOM_LOCALIZATION_CONFIGURATION_TOKEN: {
      newPackage: '@o3r/localization'
    },
    LocalizationModule: {
      newPackage: '@o3r/localization'
    },
    createTranslateLoader: {
      newPackage: '@o3r/localization'
    },
    translateLoaderProvider: {
      newPackage: '@o3r/localization'
    },
    LocalizationService: {
      newPackage: '@o3r/localization'
    },
    LOCALIZATION_CONFIGURATION_TOKEN: {
      newPackage: '@o3r/localization'
    },
    LocalizedCurrencyPipe: {
      newPackage: '@o3r/localization'
    },
    LocalizedDatePipe: {
      newPackage: '@o3r/localization'
    },
    LocalizedDecimalPipe: {
      newPackage: '@o3r/localization'
    },
    TextDirectionService: {
      newPackage: '@o3r/localization'
    },
    TextDirectionality: {
      newPackage: '@o3r/localization'
    },
    TranslationsLoader: {
      newPackage: '@o3r/localization'
    },
    lazyArray: {
      newPackage: '@o3r/components'
    },
    UuidGenerator: {
      newPackage: '@otter/services/uuid-generator'
    },
    deviceBreakpoints: {
      newPackage: '@o3r/styling'
    },
    ContextInput: {
      newPackage: '@o3r/core'
    },
    BaseContextOutput: {
      newPackage: '@o3r/core'
    },
    EventEmitterify: {
      newPackage: '@o3r/core'
    },
    Context: {
      newPackage: '@o3r/core'
    },
    Functionify: {
      newPackage: '@o3r/core'
    },
    TemplateContext: {
      newPackage: '@o3r/core'
    },
    ForwardFocus: {
      newPackage: '@o3r/components'
    },
    rehydrate: {
      newPackage: '@o3r/core'
    },
    AsyncStorage: {
      newPackage: '@o3r/core'
    },
    AsyncStorageSyncOptions: {
      newPackage: '@o3r/core'
    },
    StorageSyncOptions: {
      newPackage: '@o3r/core'
    },
    isLocalStorageConfig: {
      newPackage: '@o3r/core'
    },
    StorageSync: {
      newPackage: '@o3r/core'
    },
    LazyMessageFormatConfig: {
      newPackage: '@o3r/localization'
    },
    CapitalizePipeModule: {
      newPackage: '@o3r/components'
    },
    CapitalizePipe: {
      newPackage: '@o3r/components'
    },
    TimeUnit: {
      newPackage: '@o3r/components'
    },
    defaultTimeUnits: {
      newPackage: '@o3r/components'
    },
    DurationPipeModule: {
      newPackage: '@o3r/components'
    },
    DurationPipe: {
      newPackage: '@o3r/components'
    },
    KeepWhiteSpacePipeModule: {
      newPackage: '@o3r/components'
    },
    KeepWhiteSpacePipe: {
      newPackage: '@o3r/components'
    },
    ReplaceWithBoldPipeModule: {
      newPackage: '@o3r/components'
    },
    ReplaceWithBoldPipe: {
      newPackage: '@o3r/components'
    },
    appBaseHrefFactory: {
      newPackage: '@o3r/routing'
    },
    ENVIRONMENT_CONFIG_TOKEN: {
      newPackage: '@o3r/routing'
    },
    AppServerRoutingModule: {
      newPackage: '@o3r/routing'
    },
    O3rOnDemandPreloadingData: {
      newPackage: '@o3r/routing'
    },
    hasPreloadingOnDemand: {
      newPackage: '@o3r/routing'
    },
    O3rOnNavigationPreloadingStrategy: {
      newPackage: '@o3r/routing'
    },
    StyleLazyLoaderModule: {
      newPackage: '@o3r/styling'
    },
    StyleURL: {
      newPackage: '@o3r/styling'
    },
    StyleLazyLoader: {
      newPackage: '@o3r/styling'
    },
    DateValidatorsModule: {
      newPackage: '@o3r/forms'
    },
    MaxDateValidator: {
      newPackage: '@o3r/forms'
    },
    MinDateValidator: {
      newPackage: '@o3r/forms'
    },
    MaxValidator: {
      newPackage: '@o3r/forms'
    },
    MinValidator: {
      newPackage: '@o3r/forms'
    },
    NumberValidatorsModule: {
      newPackage: '@o3r/forms'
    }
  },
  '@otter/common/fwk/analytics/services/event-track/fixtures/jasmine': {
    EventTrackServiceFixture: {
      newPackage: '@o3r/analytics/fixtures/jasmine'
    }
  },
  '@otter/common/fwk/analytics/services/event-track/fixtures/jest': {
    EventTrackServiceFixture: {
      newPackage: '@o3r/analytics/fixtures/jest'
    }
  },
  '@otter/core': {
    InterfaceOf: {
      newPackage: '@o3r/core'
    },
    LabelValue: {
      newPackage: '@o3r/core'
    },
    Block: {
      newPackage: '@o3r/core'
    },
    CustomConfig: {
      newPackage: '@o3r/core'
    },
    ExposedComponent: {
      newPackage: '@o3r/core'
    },
    Page: {
      newPackage: '@o3r/core'
    },
    AppRuntimeConfiguration: {
      newPackage: '@o3r/core'
    },
    AppBuildConfiguration: {
      newPackage: '@o3r/core'
    },
    AsyncInput: {
      newPackage: '@o3r/forms'
    },
    Configuration: {
      newPackage: '@o3r/core'
    },
    ConfigurationValueType: {
      newPackage: '@o3r/core'
    },
    NestedConfiguration: {
      newPackage: '@o3r/core'
    },
    StrictConfiguration: {
      newPackage: '@o3r/core'
    },
    DynamicConfigurable: {
      newPackage: '@o3r/configuration'
    },
    Configurable: {
      newPackage: '@o3r/configuration'
    },
    ErrorMessages: {
      newPackage: '@o3r/configuration'
    },
    Identifiable: {
      newPackage: '@o3r/configuration'
    },
    computeConfigurationName: {
      newPackage: '@o3r/configuration'
    },
    parseConfigurationName: {
      newPackage: '@o3r/configuration'
    },
    getConfiguration: {
      newPackage: '@o3r/configuration'
    },
    InputMerge: {
      newPackage: '@o3r/localization'
    },
    Translation: {
      newPackage: '@o3r/core'
    },
    Translatable: {
      newPackage: '@o3r/localization'
    },
    Localization: {
      newPackage: '@o3r/localization'
    },
    ApiManager: {
      newPackage: '@o3r/apis-manager'
    },
    BuildTimeProperties: {
      newPackage: '@o3r/core'
    },
    DEFAULT_BUILD_PROPERTIES: {
      newPackage: '@o3r/core'
    },
    LocalizationConfiguration: {
      newPackage: '@o3r/localization'
    },
    DEFAULT_LOCALIZATION_CONFIGURATION: {
      newPackage: '@o3r/localization'
    },
    FixtureUsageError: {
      newPackage: '@o3r/testing'
    },
    TranspilationPurposeOnlyError: {
      newPackage: '@o3r/testing'
    },
    ErrorMessageObject: {
      newPackage: '@o3r/forms'
    },
    ElementError: {
      newPackage: '@o3r/forms'
    },
    FormError: {
      newPackage: '@o3r/forms'
    },
    BootstrapConfig: {
      newPackage: '@o3r/core'
    },
    Dataset: {
      newPackage: '@o3r/core'
    },
    FlightType: {
      newPackage: '@otter/demo-components'
    },
    padNumber: {
      newPackage: '@o3r/core'
    },
    generateALFLink: {
      newPackage: '@otter/application'
    },
    isProductionEnvironment: {
      newPackage: '@o3r/core'
    },
    isDate: {
      newPackage: '@o3r/core'
    },
    isObject: {
      newPackage: '@o3r/core'
    },
    immutablePrimitive: {
      newPackage: '@o3r/core'
    },
    deepFill: {
      newPackage: '@o3r/core'
    },
    getAmaClientSession: {
      newPackage: '@otter/application'
    },
    getAmaClientSessionId: {
      newPackage: '@otter/application'
    }
  },
  '@otter/devkit': {
    FallbackToPipe: {
      newPackage: '@o3r/chrome-devtools'
    },
    DebugPanelPresComponent: {
      newPackage: '@o3r/chrome-devtools'
    },
    DebugPanelPresModule: {
      newPackage: '@o3r/chrome-devtools'
    },
    InjectContentMessage: {
      newPackage: '@o3r/core'
    },
    ConnectContentMessage: {
      newPackage: '@o3r/core'
    },
    DisplayLocalizationKeysContentMessage: {
      newPackage: '@o3r/localization'
    },
    ApplicationInformationContentMessage: {
      newPackage: '@o3r/application'
    },
    RulesEngineDebugEventsContentMessage: {
      newPackage: '@o3r/rules-engine'
    },
    RequestMessagesContentMessage: {
      newPackage: '@o3r/core'
    },
    ToggleVisualTestingMessage: {
      newPackage: '@o3r/application'
    },
    ConfigurationsMessage: {
      newPackage: '@o3r/configuration'
    },
    UpdateConfigMessage: {
      newPackage: '@o3r/configuration'
    },
    SelectedComponentInfoMessage: {
      newPackage: '@o3r/components'
    },
    ToggleInspectorMessage: {
      newPackage: '@o3r/components'
    },
    AvailableMessageContents: {
      newPackage: '@o3r/chrome-devtools'
    },
    ExtensionMessage: {
      newPackage: '@o3r/chrome-devtools'
    },
    OtterLikeComponentInfo: {
      newPackage: '@o3r/components'
    },
    INSPECTOR_CLASS: {
      newPackage: '@o3r/components'
    },
    isContainer: {
      newPackage: '@o3r/components'
    },
    getConfigId: {
      newPackage: '@o3r/components'
    },
    getTranslationsRec: {
      newPackage: '@o3r/components'
    },
    getTranslations: {
      newPackage: '@o3r/components'
    },
    getAnalyticEventsRec: {
      newPackage: '@o3r/components'
    },
    getAnalyticEvents: {
      newPackage: '@o3r/components'
    },
    getOtterLikeComponentInfo: {
      newPackage: '@o3r/components'
    },
    OtterInspectorService: {
      newPackage: '@o3r/components'
    },
    Ng: {
      newPackage: '@o3r/components'
    }
  },
  '@otter/rules-engine': {
    ActionUpdateConfigBlock: {
      newPackage: '@o3r/rules-engine'
    },
    ActionUpdateAssetBlock: {
      newPackage: '@o3r/rules-engine'
    },
    ActionUpdateLocalisationBlock: {
      newPackage: '@o3r/rules-engine'
    },
    ActionUpdatePlaceholderBlock: {
      newPackage: '@o3r/rules-engine'
    },
    ActionOverrideBlock: {
      newPackage: '@o3r/rules-engine'
    },
    LinkableToRuleset: {
      newPackage: '@o3r/rules-engine'
    },
    FactsService: {
      newPackage: '@o3r/rules-engine'
    },
    PortalFacts: {
      newPackage: '@o3r/rules-engine'
    },
    RulesEngineService: {
      newPackage: '@o3r/rules-engine'
    },
    RULES_ENGINE_OPTIONS: {
      newPackage: '@o3r/rules-engine'
    },
    DEFAULT_RULES_ENGINE_OPTIONS: {
      newPackage: '@o3r/rules-engine'
    },
    RulesEngineOptions: {
      newPackage: '@o3r/rules-engine',
      newValue: 'RulesEngineServiceOptions'
    },
    RulesEngineModule: {
      newPackage: '@o3r/rules-engine'
    },
    PlaceholderTemplateResponseEffect: {
      newPackage: '@o3r/rules-engine'
    }
  },
  '@otter/rules-engine/fixtures/jasmine': {
    RulesEngineServiceFixture: {
      newPackage: '@o3r/rules-engine/fixtures/jasmine'
    }
  },
  '@otter/rules-engine/fixtures/jest': {
    RulesEngineServiceFixture: {
      newPackage: '@otter/rules-engine/fixtures/jest'
    }
  },
  '@otter/rules-engine-core': {
    Operand: {
      newPackage: '@o3r/rules-engine'
    },
    OperandFact: {
      newPackage: '@o3r/rules-engine'
    },
    GenericOperand: {
      newPackage: '@o3r/rules-engine'
    },
    UnaryOperation: {
      newPackage: '@o3r/rules-engine'
    },
    BinaryOperation: {
      newPackage: '@o3r/rules-engine'
    },
    NestedCondition: {
      newPackage: '@o3r/rules-engine'
    },
    AllConditions: {
      newPackage: '@o3r/rules-engine'
    },
    AnyConditions: {
      newPackage: '@o3r/rules-engine'
    },
    NotCondition: {
      newPackage: '@o3r/rules-engine'
    },
    TopLevelCondition: {
      newPackage: '@o3r/rules-engine'
    },
    RuleEvent: {
      newPackage: '@o3r/rules-engine'
    },
    Rule: {
      newPackage: '@o3r/rules-engine'
    },
    ActionTypes: {
      newPackage: '@o3r/rules-engine'
    },
    ConditionBlockTypes: {
      newPackage: '@o3r/rules-engine'
    },
    RuleElement: {
      newPackage: '@o3r/rules-engine'
    },
    ActionBlock: {
      newPackage: '@o3r/rules-engine'
    },
    ActionSetTemporaryFactBlock: {
      newPackage: '@o3r/rules-engine'
    },
    RuleBlock: {
      newPackage: '@o3r/rules-engine'
    },
    AllBlock: {
      newPackage: '@o3r/rules-engine'
    },
    IfElseBlock: {
      newPackage: '@o3r/rules-engine'
    },
    Ruleset: {
      newPackage: '@o3r/rules-engine'
    },
    RetrieveFactFuncType: {
      newPackage: '@o3r/rules-engine'
    },
    RulesetExecutor: {
      newPackage: '@o3r/rules-engine'
    },
    RulesEngine: {
      newPackage: '@o3r/rules-engine'
    },
    CrossPlatformPerformance: {
      newPackage: '@o3r/rules-engine'
    },
    FactObject: {
      newPackage: '@o3r/rules-engine'
    },
    Facts: {
      newPackage: '@o3r/rules-engine'
    },
    RulesEngineOptions: {
      newPackage: '@o3r/rules-engine'
    },
    EngineRule: {
      newPackage: '@o3r/rules-engine'
    },
    EngineRuleset: {
      newPackage: '@o3r/rules-engine'
    },
    TimedEvent: {
      newPackage: '@o3r/rules-engine'
    },
    EvaluationReason: {
      newPackage: '@o3r/rules-engine'
    },
    RuleEvaluation: {
      newPackage: '@o3r/rules-engine'
    },
    RuleEvaluationOutput: {
      newPackage: '@o3r/rules-engine'
    },
    BaseRulesetExecution: {
      newPackage: '@o3r/rules-engine'
    },
    RulesetExecutionEvent: {
      newPackage: '@o3r/rules-engine'
    },
    RulesetExecutionErrorEvent: {
      newPackage: '@o3r/rules-engine'
    },
    ActiveRulesetsEvent: {
      newPackage: '@o3r/rules-engine'
    },
    AllActionsEvent: {
      newPackage: '@o3r/rules-engine'
    },
    AvailableRulesets: {
      newPackage: '@o3r/rules-engine'
    },
    DebugEvent: {
      newPackage: '@o3r/rules-engine'
    },
    isConditionProperties: {
      newPackage: '@o3r/rules-engine'
    },
    isOperandFact: {
      newPackage: '@o3r/rules-engine'
    },
    isOperandRuntimeFact: {
      newPackage: '@o3r/rules-engine'
    },
    isOperandLiteral: {
      newPackage: '@o3r/rules-engine'
    },
    isAllConditions: {
      newPackage: '@o3r/rules-engine'
    },
    isAnyConditions: {
      newPackage: '@o3r/rules-engine'
    },
    isNotCondition: {
      newPackage: '@o3r/rules-engine'
    },
    Operator: {
      newPackage: '@o3r/rules-engine'
    },
    UnaryOperator: {
      newPackage: '@o3r/rules-engine'
    },
    SupportedSimpleTypes: {
      newPackage: '@o3r/rules-engine'
    },
    numberValidator: {
      newPackage: '@o3r/rules-engine'
    },
    executeOperator: {
      newPackage: '@o3r/rules-engine'
    },
    operatorList: {
      newPackage: '@o3r/rules-engine'
    },
    greaterThanOrEqual: {
      newPackage: '@o3r/rules-engine'
    },
    greaterThan: {
      newPackage: '@o3r/rules-engine'
    },
    lessOrEqual: {
      newPackage: '@o3r/rules-engine'
    },
    lessThan: {
      newPackage: '@o3r/rules-engine'
    },
    numberBasedOperators: {
      newPackage: '@o3r/rules-engine'
    },
    isValidDate: {
      newPackage: '@o3r/rules-engine'
    },
    inRangeDate: {
      newPackage: '@o3r/rules-engine'
    },
    dateBefore: {
      newPackage: '@o3r/rules-engine'
    },
    dateAfter: {
      newPackage: '@o3r/rules-engine'
    },
    dateEquals: {
      newPackage: '@o3r/rules-engine'
    },
    dateNotEquals: {
      newPackage: '@o3r/rules-engine'
    },
    dateBasedOperators: {
      newPackage: '@o3r/rules-engine'
    },
    equals: {
      newPackage: '@o3r/rules-engine'
    },
    notEquals: {
      newPackage: '@o3r/rules-engine'
    },
    inArray: {
      newPackage: '@o3r/rules-engine'
    },
    notInArray: {
      newPackage: '@o3r/rules-engine'
    },
    inString: {
      newPackage: '@o3r/rules-engine'
    },
    notInString: {
      newPackage: '@o3r/rules-engine'
    },
    isDefined: {
      newPackage: '@o3r/rules-engine'
    },
    isUndefined: {
      newPackage: '@o3r/rules-engine'
    },
    basicOperators: {
      newPackage: '@o3r/rules-engine'
    },
    arrayContains: {
      newPackage: '@o3r/rules-engine'
    },
    stringContains: {
      newPackage: '@o3r/rules-engine'
    },
    notArrayContains: {
      newPackage: '@o3r/rules-engine'
    },
    notStringContains: {
      newPackage: '@o3r/rules-engine'
    },
    allEqual: {
      newPackage: '@o3r/rules-engine'
    },
    allGreater: {
      newPackage: '@o3r/rules-engine'
    },
    allIn: {
      newPackage: '@o3r/rules-engine'
    },
    allNotIn: {
      newPackage: '@o3r/rules-engine'
    },
    allLower: {
      newPackage: '@o3r/rules-engine'
    },
    allMatch: {
      newPackage: '@o3r/rules-engine'
    },
    allRangeNumber: {
      newPackage: '@o3r/rules-engine'
    },
    oneEquals: {
      newPackage: '@o3r/rules-engine'
    },
    oneGreater: {
      newPackage: '@o3r/rules-engine'
    },
    oneIn: {
      newPackage: '@o3r/rules-engine'
    },
    oneLower: {
      newPackage: '@o3r/rules-engine'
    },
    oneMatches: {
      newPackage: '@o3r/rules-engine'
    },
    oneRangeNumber: {
      newPackage: '@o3r/rules-engine'
    },
    lengthEquals: {
      newPackage: '@o3r/rules-engine'
    },
    lengthNotEquals: {
      newPackage: '@o3r/rules-engine'
    },
    lengthLessThanOrEquals: {
      newPackage: '@o3r/rules-engine'
    },
    lengthLessThan: {
      newPackage: '@o3r/rules-engine'
    },
    lengthGreaterThanOrEquals: {
      newPackage: '@o3r/rules-engine'
    },
    lengthGreaterThan: {
      newPackage: '@o3r/rules-engine'
    },
    arrayBasedOperators: {
      newPackage: '@o3r/rules-engine'
    },
    filterRulesetsEventStream: {
      newPackage: '@o3r/rules-engine'
    },
    FactBasicValues: {
      newPackage: '@o3r/rules-engine'
    },
    FactDefinitions: {
      newPackage: '@o3r/rules-engine'
    },
    FactFactoryReturn: {
      newPackage: '@o3r/rules-engine'
    },
    FactSet: {
      newPackage: '@o3r/rules-engine'
    },
    FactValueStream: {
      newPackage: '@o3r/rules-engine'
    },
    Fact: {
      newPackage: '@o3r/rules-engine'
    },
    EngineDebuggerOptions: {
      newPackage: '@o3r/rules-engine'
    },
    EngineDebugger: {
      newPackage: '@o3r/rules-engine'
    },
    retrieveRulesetTriggers: {
      newPackage: '@o3r/rules-engine'
    },
    flagCachedRules: {
      newPackage: '@o3r/rules-engine'
    },
    handleRuleEvaluationDebug: {
      newPackage: '@o3r/rules-engine'
    }
  },
  '@otter/services/configuration': {
    ConfigurationObserver: {
      newPackage: '@o3r/configuration'
    },
    ConfigurationBaseService: {
      newPackage: '@o3r/configuration'
    },
    ConfigurationBaseServiceModule: {
      newPackage: '@o3r/configuration'
    }
  },
  '@otter/services/configuration/fixtures/jasmine': {
    ConfigurationBaseServiceFixture: {
      newPackage: '@o3r/configuration/fixtures/jasmine'
    }
  },
  '@otter/services/configuration/fixtures/jest': {
    ConfigurationBaseServiceFixture: {
      newPackage: '@o3r/configuration/fixtures/jasmine'
    }
  },
  '@otter/services/fullstory-logger-client': {
    FullStoryClient: {
      newPackage: '@o3r/logger'
    }
  },
  '@otter/services/logger': {
    LoggerClient: {
      newPackage: '@o3r/logger'
    },
    LoggerModule: {
      newPackage: '@o3r/logger'
    },
    LoggerService: {
      newPackage: '@o3r/logger'
    },
    LOGGER_CLIENT_TOKEN: {
      newPackage: '@o3r/logger'
    }
  },
  '@otter/services/logrocket-logger-client': {
    LogRocketClient: {
      newPackage: '@o3r/logger'
    }
  },
  '@otter/services/smartlook-logger-client': {
    SmartLookClient: {
      newPackage: '@o3r/logger'
    }
  },
  '@otter/store/common': {
    Serializer: {
      newPackage: '@o3r/core'
    },
    StateSerializer: {
      newPackage: '@o3r/core'
    },
    LocalStateModel: {
      newPackage: '@o3r/core'
    },
    Idfy: {
      newPackage: '@o3r/core'
    },
    UpdateActionPayload: {
      newPackage: '@o3r/core'
    },
    SetActionPayload: {
      newPackage: '@o3r/core'
    },
    SetStateActionPayload: {
      newPackage: '@o3r/core'
    },
    FailActionPayload: {
      newPackage: '@o3r/core'
    },
    keep: {
      newPackage: '@o3r/core'
    },
    UpdateEntitiesActionPayload: {
      newPackage: '@o3r/core'
    },
    UpdateEntitiesActionPayloadWithId: {
      newPackage: '@o3r/core'
    },
    UpdateEntityActionPayload: {
      newPackage: '@o3r/core'
    },
    UpdateEntityActionPayloadWithId: {
      newPackage: '@o3r/core'
    },
    SetEntitiesActionPayload: {
      newPackage: '@o3r/core'
    },
    SetEntityActionPayload: {
      newPackage: '@o3r/core'
    },
    FailEntitiesActionPayload: {
      newPackage: '@o3r/core'
    },
    ClearOnFailurePayload: {
      newPackage: '@o3r/core'
    },
    StoreSyncSerializers: {
      newPackage: '@o3r/core'
    },
    isSerializer: {
      newPackage: '@o3r/core'
    },
    StoreSyncConfig: {
      newPackage: '@o3r/core'
    },
    EntityAsyncRequestAdapter: {
      newPackage: '@o3r/core'
    },
    createEntityAsyncRequestAdapter: {
      newPackage: '@o3r/core'
    },
    AsyncStoreItemAdapter: {
      newPackage: '@o3r/core'
    },
    asyncStoreItemAdapter: {
      newPackage: '@o3r/core'
    },
    isCallAction: {
      newPackage: '@o3r/core'
    },
    isIdentifiedCallAction: {
      newPackage: '@o3r/core'
    },
    isAsyncRequest: {
      newPackage: '@o3r/core'
    },
    RequestId: {
      newPackage: '@o3r/core'
    },
    AsyncRequest: {
      newPackage: '@o3r/core'
    },
    AsyncStoreItem: {
      newPackage: '@o3r/core'
    },
    FromApiActionPayload: {
      newPackage: '@o3r/core'
    },
    ExtractFromApiActionPayloadType: {
      newPackage: '@o3r/core'
    },
    FromApiActionPayloadWithEntityId: {
      newPackage: '@o3r/core'
    },
    WithRequestId: {
      newPackage: '@o3r/core'
    },
    SetAsyncStoreItemActionPayload: {
      newPackage: '@o3r/core'
    },
    UpdateAsyncStoreItemEntitiesActionPayload: {
      newPackage: '@o3r/core'
    },
    UpdateAsyncStoreItemEntitiesActionPayloadWithId: {
      newPackage: '@o3r/core'
    },
    UpdateAsyncStoreItemEntityActionPayload: {
      newPackage: '@o3r/core'
    },
    UpdateAsyncStoreItemEntityActionPayloadWithId: {
      newPackage: '@o3r/core'
    },
    SetAsyncStoreItemEntitiesActionPayload: {
      newPackage: '@o3r/core'
    },
    SetAsyncStoreItemEntityActionPayload: {
      newPackage: '@o3r/core'
    },
    FailAsyncStoreItemEntityActionPayload: {
      newPackage: '@o3r/core'
    },
    FailAsyncStoreItemEntitiesActionPayload: {
      newPackage: '@o3r/core'
    },
    EntityStatus: {
      newPackage: '@o3r/core'
    },
    EntityWithStatus: {
      newPackage: '@o3r/core'
    },
    EntityWithoutAsyncStoreItem: {
      newPackage: '@o3r/core'
    }
  },
  '@otter/store/configuration': {
    SetConfigurationEntitiesPayload: {
      newPackage: '@o3r/configuration'
    },
    UpsertConfigurationEntityPayload: {
      newPackage: '@o3r/configuration'
    },
    UpdateConfigurationEntityPayload: {
      newPackage: '@o3r/configuration'
    },
    upsertConfigurationEntity: {
      newPackage: '@o3r/configuration'
    },
    updateConfigurationEntity: {
      newPackage: '@o3r/configuration'
    },
    setConfigurationEntities: {
      newPackage: '@o3r/configuration'
    },
    updateConfigurationEntities: {
      newPackage: '@o3r/configuration'
    },
    upsertConfigurationEntities: {
      newPackage: '@o3r/configuration'
    },
    clearConfigurationEntities: {
      newPackage: '@o3r/configuration'
    },
    computeConfiguration: {
      newPackage: '@o3r/configuration'
    },
    CONFIGURATION_REDUCER_TOKEN: {
      newPackage: '@o3r/configuration'
    },
    getDefaultConfigurationReducer: {
      newPackage: '@o3r/configuration'
    },
    ConfigurationStoreModule: {
      newPackage: '@o3r/configuration'
    },
    configurationAdapter: {
      newPackage: '@o3r/configuration'
    },
    configurationInitialState: {
      newPackage: '@o3r/configuration'
    },
    configurationReducerFeatures: {
      newPackage: '@o3r/configuration'
    },
    configurationReducer: {
      newPackage: '@o3r/configuration'
    },
    selectConfigurationState: {
      newPackage: '@o3r/configuration'
    },
    selectConfigurationIds: {
      newPackage: '@o3r/configuration'
    },
    selectAllConfiguration: {
      newPackage: '@o3r/configuration'
    },
    selectConfigurationEntities: {
      newPackage: '@o3r/configuration'
    },
    selectConfigurationTotal: {
      newPackage: '@o3r/configuration'
    },
    selectConfigurationForComponent: {
      newPackage: '@o3r/configuration'
    },
    ConfigurationModel: {
      newPackage: '@o3r/configuration'
    },
    ConfigurationState: {
      newPackage: '@o3r/configuration'
    },
    CONFIGURATION_STORE_NAME: {
      newPackage: '@o3r/configuration'
    },
    ConfigurationStore: {
      newPackage: '@o3r/configuration'
    },
    configurationStorageSync: {
      newPackage: '@o3r/configuration'
    }
  },
  '@otter/store/event-track': {
    SetHeroComponentTTIPayload: {
      newPackage: '@o3r/analytics'
    },
    setEventTrack: {
      newPackage: '@o3r/analytics'
    },
    updateEventTrack: {
      newPackage: '@o3r/analytics'
    },
    resetEventTrack: {
      newPackage: '@o3r/analytics'
    },
    registerHeroComponent: {
      newPackage: '@o3r/analytics'
    },
    setHeroComponentTTI: {
      newPackage: '@o3r/analytics'
    },
    EVENT_TRACK_REDUCER_TOKEN: {
      newPackage: '@o3r/analytics'
    },
    getDefaultEventTrackReducer: {
      newPackage: '@o3r/analytics'
    },
    EventTrackStoreModule: {
      newPackage: '@o3r/analytics'
    },
    heroComponentInitialState: {
      newPackage: '@o3r/analytics'
    },
    eventTrackInitialState: {
      newPackage: '@o3r/analytics'
    },
    eventTrackReducerFeatures: {
      newPackage: '@o3r/analytics'
    },
    eventTrackReducer: {
      newPackage: '@o3r/analytics'
    },
    selectEventTrackState: {
      newPackage: '@o3r/analytics'
    },
    selectHeroComponentStatus: {
      newPackage: '@o3r/analytics'
    },
    HeroComponent: {
      newPackage: '@o3r/analytics'
    },
    RegisterHeroComponentPayload: {
      newPackage: '@o3r/analytics'
    },
    EventTrackState: {
      newPackage: '@o3r/analytics'
    },
    EVENT_TRACK_STORE_NAME: {
      newPackage: '@o3r/analytics'
    },
    EventTrackStore: {
      newPackage: '@o3r/analytics'
    },
    eventTrackStorageSync: {
      newPackage: '@o3r/analytics'
    }
  },
  '@otter/store/form-error-messages': {
    RemoveFormErrorMessagesPayload: {
      newPackage: '@o3r/forms'
    },
    removeFormErrorMessagesEntity: {
      newPackage: '@o3r/forms'
    },
    resetFormErrorMessages: {
      newPackage: '@o3r/forms'
    },
    setFormErrorMessagesEntities: {
      newPackage: '@o3r/forms'
    },
    upsertFormErrorMessagesEntities: {
      newPackage: '@o3r/forms'
    },
    clearFormErrorMessagesEntities: {
      newPackage: '@o3r/forms'
    },
    FORM_ERROR_MESSAGES_REDUCER_TOKEN: {
      newPackage: '@o3r/forms'
    },
    getDefaultFormErrorMessagesReducer: {
      newPackage: '@o3r/forms'
    },
    FormErrorMessagesStoreModule: {
      newPackage: '@o3r/forms'
    },
    formErrorMessagesAdapter: {
      newPackage: '@o3r/forms'
    },
    formErrorMessagesInitialState: {
      newPackage: '@o3r/forms'
    },
    formErrorMessagesReducer: {
      newPackage: '@o3r/forms'
    },
    selectFormErrorMessagesState: {
      newPackage: '@o3r/forms'
    },
    selectFormErrorMessagesIds: {
      newPackage: '@o3r/forms'
    },
    selectAllFormErrorMessages: {
      newPackage: '@o3r/forms'
    },
    selectFormErrorMessagesEntities: {
      newPackage: '@o3r/forms'
    },
    selectFormErrorMessagesTotal: {
      newPackage: '@o3r/forms'
    },
    selectAllElementErrors: {
      newPackage: '@o3r/forms'
    },
    selectAllErrorMessageObjects: {
      newPackage: '@o3r/forms'
    },
    FormErrorModel: {
      newPackage: '@o3r/forms'
    },
    FormErrorMessagesState: {
      newPackage: '@o3r/forms'
    },
    FORM_ERROR_MESSAGES_STORE_NAME: {
      newPackage: '@o3r/forms'
    },
    FormErrorMessagesStore: {
      newPackage: '@o3r/forms'
    }
  },
  '@otter/store/routing-guard': {
    RegisteredItemStatus: {
      newPackage: '@o3r/routing'
    },
    RegisteredItemFailureReason: {
      newPackage: '@o3r/routing'
    },
    RoutingGuardModel: {
      newPackage: '@o3r/routing'
    },
    RoutingGuardState: {
      newPackage: '@o3r/routing'
    },
    ROUTING_GUARD_STORE_NAME: {
      newPackage: '@o3r/routing'
    },
    RoutingGuardStore: {
      newPackage: '@o3r/routing'
    },
    selectRoutingGuardState: {
      newPackage: '@o3r/routing'
    },
    selectRoutingGuardIds: {
      newPackage: '@o3r/routing'
    },
    selectAllRoutingGuard: {
      newPackage: '@o3r/routing'
    },
    selectRoutingGuardEntities: {
      newPackage: '@o3r/routing'
    },
    selectRoutingGuardTotal: {
      newPackage: '@o3r/routing'
    },
    selectRoutingGuardEntitiesStatusList: {
      newPackage: '@o3r/routing'
    },
    selectRoutingGuardEntitiesBlockingReasons: {
      newPackage: '@o3r/routing'
    },
    hasNoEntitiesInPendingState: {
      newPackage: '@o3r/routing'
    },
    hasNoEntitiesInFailureState: {
      newPackage: '@o3r/routing'
    },
    hasNoEntityInReadyOrFailureState: {
      newPackage: '@o3r/routing'
    },
    hasNoEntityFailureStateWithReasons: {
      newPackage: '@o3r/routing'
    },
    routingGuardAdapter: {
      newPackage: '@o3r/routing'
    },
    routingGuardInitialState: {
      newPackage: '@o3r/routing'
    },
    routingGuardReducerFeatures: {
      newPackage: '@o3r/routing'
    },
    routingGuardReducer: {
      newPackage: '@o3r/routing'
    },
    ROUTING_GUARD_REDUCER_TOKEN: {
      newPackage: '@o3r/routing'
    },
    getDefaultRoutingGuardReducer: {
      newPackage: '@o3r/routing'
    },
    RoutingGuardStoreModule: {
      newPackage: '@o3r/routing'
    },
    RoutingGuardActionPayload: {
      newPackage: '@o3r/routing'
    },
    RoutingGuardFailureReasonPayload: {
      newPackage: '@o3r/routing'
    },
    registerRoutingGuardEntity: {
      newPackage: '@o3r/routing'
    },
    setRoutingGuardEntityAsFailure: {
      newPackage: '@o3r/routing'
    },
    setRoutingGuardEntityAsSuccessAndClearReason: {
      newPackage: '@o3r/routing'
    },
    setRoutingGuardEntityAsPending: {
      newPackage: '@o3r/routing'
    },
    clearRoutingGuardEntities: {
      newPackage: '@o3r/routing'
    },
    clearRoutingGuardEntitiesFailureReason: {
      newPackage: '@o3r/routing'
    },
    setRoutingGuardEntityFailureWithReason: {
      newPackage: '@o3r/routing'
    },
    NgrxStoreRouterEffect: {
      newPackage: '@o3r/routing'
    }
  },
  '@otter/store/rules-engine': {
    AssetPathOverrideStore: {
      newPackage: '@o3r/dynamic-content'
    },
    ASSET_PATH_OVERRIDE_STORE_NAME: {
      newPackage: '@o3r/dynamic-content'
    },
    AssetPathOverrideState: {
      newPackage: '@o3r/dynamic-content'
    },
    assetPathOverrideStorageDeserializer: {
      newPackage: '@o3r/dynamic-content'
    },
    assetPathOverrideStorageSync: {
      newPackage: '@o3r/dynamic-content'
    },
    selectAssetPathOverrideState: {
      newPackage: '@o3r/dynamic-content'
    },
    selectAssetPathOverride: {
      newPackage: '@o3r/dynamic-content'
    },
    assetPathOverrideInitialState: {
      newPackage: '@o3r/dynamic-content'
    },
    assetPathOverrideReducerFeatures: {
      newPackage: '@o3r/dynamic-content'
    },
    assetPathOverrideReducer: {
      newPackage: '@o3r/dynamic-content'
    },
    ASSET_PATH_OVERRIDE_REDUCER_TOKEN: {
      newPackage: '@o3r/dynamic-content'
    },
    getDefaultAssetPathOverrideReducer: {
      newPackage: '@o3r/dynamic-content'
    },
    AssetPathOverrideStoreModule: {
      newPackage: '@o3r/dynamic-content'
    },
    setAssetPathOverride: {
      newPackage: '@o3r/dynamic-content'
    },
    ConfigOverrideStore: {
      newPackage: '@o3r/configuration'
    },
    CONFIG_OVERRIDE_STORE_NAME: {
      newPackage: '@o3r/configuration'
    },
    ConfigOverrideState: {
      newPackage: '@o3r/configuration'
    },
    PropertyOverride: {
      newPackage: '@o3r/configuration'
    },
    configOverrideStorageDeserializer: {
      newPackage: '@o3r/configuration'
    },
    configOverrideStorageSync: {
      newPackage: '@o3r/configuration'
    },
    selectConfigOverrideState: {
      newPackage: '@o3r/configuration'
    },
    selectConfigOverride: {
      newPackage: '@o3r/configuration'
    },
    selectComponentOverrideConfig: {
      newPackage: '@o3r/configuration'
    },
    configOverrideInitialState: {
      newPackage: '@o3r/configuration'
    },
    configOverrideReducerFeatures: {
      newPackage: '@o3r/configuration'
    },
    configOverrideReducer: {
      newPackage: '@o3r/configuration'
    },
    CONFIG_OVERRIDE_REDUCER_TOKEN: {
      newPackage: '@o3r/configuration'
    },
    getDefaultConfigOverrideReducer: {
      newPackage: '@o3r/configuration'
    },
    ConfigOverrideStoreModule: {
      newPackage: '@o3r/configuration'
    },
    setConfigOverride: {
      newPackage: '@o3r/configuration'
    },
    PlaceholderTemplateStore: {
      newPackage: '@o3r/components'
    },
    PLACEHOLDER_TEMPLATE_STORE_NAME: {
      newPackage: '@o3r/components'
    },
    PlaceholderTemplateState: {
      newPackage: '@o3r/components'
    },
    PlaceholderTemplateStateDetails: {
      newPackage: '@o3r/components'
    },
    PlaceholderTemplateModel: {
      newPackage: '@o3r/components'
    },
    PlaceholderTemplateReply: {
      newPackage: '@o3r/components'
    },
    PlaceholderVariable: {
      newPackage: '@o3r/components'
    },
    placeholderTemplateStorageSerializer: {
      newPackage: '@o3r/components'
    },
    placeholderTemplateStorageDeserializer: {
      newPackage: '@o3r/components'
    },
    placeholderTemplateStorageSync: {
      newPackage: '@o3r/components'
    },
    selectPlaceholderTemplateState: {
      newPackage: '@o3r/components'
    },
    selectPlaceholderTemplateIds: {
      newPackage: '@o3r/components'
    },
    selectAllPlaceholderTemplate: {
      newPackage: '@o3r/components'
    },
    selectPlaceholderTemplateEntities: {
      newPackage: '@o3r/components'
    },
    selectPlaceholderTemplateTotal: {
      newPackage: '@o3r/components'
    },
    selectPlaceholderTemplateStorePendingStatus: {
      newPackage: '@o3r/components'
    },
    selectPlaceholderTemplateEntity: {
      newPackage: '@o3r/components'
    },
    selectPlaceholderTemplateUrls: {
      newPackage: '@o3r/components'
    },
    placeholderTemplateAdapter: {
      newPackage: '@o3r/components'
    },
    placeholderTemplateInitialState: {
      newPackage: '@o3r/components'
    },
    placeholderTemplateReducerFeatures: {
      newPackage: '@o3r/components'
    },
    placeholderTemplateReducer: {
      newPackage: '@o3r/components'
    },
    PLACEHOLDER_TEMPLATE_REDUCER_TOKEN: {
      newPackage: '@o3r/components'
    },
    getDefaultPlaceholderTemplateReducer: {
      newPackage: '@o3r/components'
    },
    PlaceholderTemplateStoreModule: {
      newPackage: '@o3r/components'
    },
    cancelPlaceholderTemplateRequest: {
      newPackage: '@o3r/components'
    },
    deletePlaceholderTemplateEntity: {
      newPackage: '@o3r/components'
    },
    setPlaceholderTemplateEntity: {
      newPackage: '@o3r/components'
    },
    failPlaceholderTemplateEntity: {
      newPackage: '@o3r/components'
    },
    setPlaceholderTemplateEntityFromUrl: {
      newPackage: '@o3r/components'
    },
    LocalizationOverrideState: {
      newPackage: '@o3r/localization'
    },
    LOCALIZATION_OVERRIDE_STORE_NAME: {
      newPackage: '@o3r/localization'
    },
    LocalizationOverrideStore: {
      newPackage: '@o3r/localization'
    },
    localizationOverrideStorageDeserializer: {
      newPackage: '@o3r/localization'
    },
    localizationOverrideStorageSync: {
      newPackage: '@o3r/localization'
    },
    selectLocalizationOverrideState: {
      newPackage: '@o3r/localization'
    },
    selectLocalizationOverride: {
      newPackage: '@o3r/localization'
    },
    localizationOverrideInitialState: {
      newPackage: '@o3r/localization'
    },
    localizationOverrideReducerFeatures: {
      newPackage: '@o3r/localization'
    },
    localizationOverrideReducer: {
      newPackage: '@o3r/localization'
    },
    LOCALIZATION_OVERRIDE_REDUCER_TOKEN: {
      newPackage: '@o3r/localization'
    },
    getDefaultLocalizationOverrideReducer: {
      newPackage: '@o3r/localization'
    },
    LocalizationOverrideStoreModule: {
      newPackage: '@o3r/localization'
    },
    setLocalizationOverride: {
      newPackage: '@o3r/localization'
    },
    RulesetsStore: {
      newPackage: '@o3r/rules-engine'
    },
    RULESETS_STORE_NAME: {
      newPackage: '@o3r/rules-engine'
    },
    RulesetsState: {
      newPackage: '@o3r/rules-engine'
    },
    RulesetsStateDetails: {
      newPackage: '@o3r/rules-engine'
    },
    RulesetsModel: {
      newPackage: '@o3r/rules-engine'
    },
    rulesetsStorageSerializer: {
      newPackage: '@o3r/rules-engine'
    },
    rulesetsStorageDeserializer: {
      newPackage: '@o3r/rules-engine'
    },
    rulesetsStorageSync: {
      newPackage: '@o3r/rules-engine'
    },
    selectRulesetsState: {
      newPackage: '@o3r/rules-engine'
    },
    selectRulesetsIds: {
      newPackage: '@o3r/rules-engine'
    },
    selectAllRulesets: {
      newPackage: '@o3r/rules-engine'
    },
    selectRulesetsEntities: {
      newPackage: '@o3r/rules-engine'
    },
    selectRulesetsTotal: {
      newPackage: '@o3r/rules-engine'
    },
    selectRulesetsStorePendingStatus: {
      newPackage: '@o3r/rules-engine'
    },
    selectActiveRuleSets: {
      newPackage: '@o3r/rules-engine'
    },
    selectRuleSetLinkComponents: {
      newPackage: '@o3r/rules-engine'
    },
    rulesetsAdapter: {
      newPackage: '@o3r/rules-engine'
    },
    rulesetsInitialState: {
      newPackage: '@o3r/rules-engine'
    },
    rulesetsReducerFeatures: {
      newPackage: '@o3r/rules-engine'
    },
    rulesetsReducer: {
      newPackage: '@o3r/rules-engine'
    },
    RULESETS_REDUCER_TOKEN: {
      newPackage: '@o3r/rules-engine'
    },
    getDefaultRulesetsReducer: {
      newPackage: '@o3r/rules-engine'
    },
    RulesetsStoreModule: {
      newPackage: '@o3r/rules-engine'
    },
    RulesetsEffect: {
      newPackage: '@o3r/rules-engine'
    },
    setRulesets: {
      newPackage: '@o3r/rules-engine'
    },
    updateRulesets: {
      newPackage: '@o3r/rules-engine'
    },
    resetRulesets: {
      newPackage: '@o3r/rules-engine'
    },
    cancelRulesetsRequest: {
      newPackage: '@o3r/rules-engine'
    },
    setRulesetsEntities: {
      newPackage: '@o3r/rules-engine'
    },
    upsertRulesetsEntities: {
      newPackage: '@o3r/rules-engine'
    },
    clearRulesetsEntities: {
      newPackage: '@o3r/rules-engine'
    },
    failRulesetsEntities: {
      newPackage: '@o3r/rules-engine'
    },
    setRulesetsEntitiesFromApi: {
      newPackage: '@o3r/rules-engine'
    },
    upsertRulesetsEntitiesFromApi: {
      newPackage: '@o3r/rules-engine'
    }
  },
  '@otter/cms-adapters': {
    validateJson: {
      newPackage: '@o3r/extractors'
    },
    StyleExtractorBuilderSchema: {
      newPackage: '@o3r/styling'
    },
    RulesEngineExtractorBuilderSchema: {
      newPackage: '@o3r/rules-engine'
    },
    LocalizationExtractorBuilderSchema: {
      newPackage: '@o3r/localization'
    },
    checkParentheses: {
      newPackage: '@o3r/localization'
    },
    checkOtherInPlural: {
      newPackage: '@o3r/localization'
    },
    ComponentExtractorBuilderSchema: {
      newPackage: '@o3r/components'
    },
    defaultLibraryName: {
      newPackage: '@o3r/components'
    },
    JSONDefinition: {
      newPackage: '@o3r/extractors'
    },
    JSONSchema: {
      newPackage: '@o3r/extractors'
    },
    JSONLocalization: {
      newPackage: '@o3r/localization'
    },
    Converter: {
      newPackage: '@o3r/extractors'
    },
    Extractor: {
      newPackage: '@o3r/extractors'
    },
    ParserFactory: {
      newPackage: '@o3r/extractors'
    },
    Output: {
      newPackage: '@o3r/core'
    },
    CmsMetadataData: {
      newPackage: '@o3r/core'
    },
    checkComponentImplementsInterface: {
      newPackage: '@o3r/extractors'
    },
    checkInterfaceExtendsInterface: {
      newPackage: '@o3r/extractors'
    },
    getReflectionDefaultValue: {
      newPackage: '@o3r/extractors'
    },
    getLibraryModulePath: {
      newPackage: '@o3r/extractors'
    },
    getLibraryCmsMetadataFileNames: {
      newPackage: '@o3r/extractors'
    },
    getLibraryCmsMetadata: {
      newPackage: '@o3r/extractors'
    },
    CommonParserFactory: {
      newPackage: '@o3r/extractors'
    },
    RulesEngineExtractor: {
      newPackage: '@o3r/rules-engine'
    },
    Fact: {
      newPackage: '@o3r/rules-engine',
      newValue: 'MetadataFact'
    },
    OperatorSupportedTypes: {
      newPackage: '@o3r/rules-engine',
      newValue: 'MetadataOperatorSupportedTypes'
    },
    allDefaultSupportedTypes: {
      newPackage: '@o3r/rules-engine'
    },
    allSupportedTypes: {
      newPackage: '@o3r/rules-engine'
    },
    Operand: {
      newPackage: '@o3r/rules-engine',
      newValue: 'MetadataOperand'
    },
    Operator: {
      newPackage: '@o3r/rules-engine',
      newValue: 'MetadataOperator'
    },
    Action: {
      newPackage: '@o3r/rules-engine'
    },
    LocalizationMetadata: {
      newPackage: '@o3r/localization'
    },
    LocalizationMetadataAsMap: {
      newPackage: '@o3r/localization'
    },
    LocalizationJsonValue: {
      newPackage: '@o3r/localization'
    },
    LocalizationJsonFile: {
      newPackage: '@o3r/localization'
    },
    LocalizationFileMap: {
      newPackage: '@o3r/localization'
    },
    LibraryMetadataMap: {
      newPackage: '@o3r/localization'
    },
    LocalizationExtractor: {
      newPackage: '@o3r/localization'
    },
    CssVariable: {
      newPackage: '@o3r/styling'
    },
    CssMetadata: {
      newPackage: '@o3r/styling'
    },
    CssVariableExtractor: {
      newPackage: '@o3r/styling'
    },
    Documentation: {
      newPackage: '@o3r/extractors'
    },
    DocumentationNode: {
      newPackage: '@o3r/extractors'
    },
    CommonDocumentationNode: {
      newPackage: '@o3r/extractors'
    },
    CommonDocumentation: {
      newPackage: '@o3r/extractors'
    },
    BaseEntity: {
      newPackage: '@o3r/extractors'
    },
    ComponentEntity: {
      newPackage: '@o3r/extractors'
    },
    DocumentationNodeType: {
      newPackage: '@o3r/extractors'
    },
    DocumentationFactory: {
      newPackage: '@o3r/extractors'
    },
    DocumentationOptions: {
      newPackage: '@o3r/extractors'
    },
    FileOptions: {
      newPackage: '@o3r/extractors'
    },
    ParserConfig: {
      newPackage: '@o3r/extractors'
    }
  },
  '@otter/ng-tools/middleware': {
    bootstrapConfigMiddleware: {
      newPackage: '@o3r/configuration/middleware'
    },
    setup: {
      newPackage: '@o3r/dynamic-content/middleware'
    }
  }

};
