import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  FormsModule,
} from '@angular/forms';
import {
  NgbAccordionModule,
  NgbDropdown,
  NgbDropdownItem,
  NgbDropdownMenu,
  NgbDropdownToggle,
} from '@ng-bootstrap/ng-bootstrap';
import {
  DynamicContentModule,
  DynamicContentService,
} from '@o3r/dynamic-content';
import {
  LoggerService,
} from '@o3r/logger';
import {
  firstValueFrom,
} from 'rxjs';
import {
  getFilesContent,
  isTrainingResource,
} from '../../helpers/file-system/index';
import {
  EditorMode,
  TrainingProject,
} from './code-editor-view';
import {
  TrainingStepPresComponent,
} from './training-step';

/** Step project content and its corresponding path */
interface StepProjectUrl {
  /** Path in step project */
  path: string;
  /** URL of content */
  contentUrl: string;
}

/** Description of training step */
interface TrainingStepDescription {
  /** Step title */
  stepTitle: string;
  /** URL to step instructions (HTML content) */
  htmlContentUrl: string;
  /** Step files configuration */
  filesConfiguration?: {
    /** Name of directory in which files will be put */
    exerciseId: string;
    /** Starting file to be displayed in the project */
    startingFile: string;
    /** Commands to run in the project */
    commands: string[];
    /** URLs of step project */
    urls: StepProjectUrl[];
    /** URLs of step solution project */
    solutionUrls?: StepProjectUrl[];
    /** Mode of the Code Editor */
    mode: EditorMode;
  };
}

/** Training program */
interface TrainingProgram {
  /** Steps of the training program */
  trainingSteps: TrainingStepDescription[];
}

/** Training step - consists of its description and its dynamic content */
type TrainingStep = {
  /** Description of the training step */
  description: TrainingStepDescription;
  /** Dynamic content of the training step */
  dynamicContent: {
    /** HTML Content - corresponds to the step instructions */
    htmlContent: WritableSignal<string>;
    /** Exercise project of the step */
    project: WritableSignal<TrainingProject | null>;
    /** Solution of the exercise project of the step */
    solutionProject: WritableSignal<TrainingProject | null>;
  };
};

/** RegExp of current step index at the end of the location URL (example: http://url/#/fragment#3) */
const currentStepLocationRegExp = new RegExp(/#([0-9]+)$/);

@Component({
  selector: 'o3r-training',
  standalone: true,
  imports: [
    DynamicContentModule,
    FormsModule,
    NgbAccordionModule,
    TrainingStepPresComponent,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgbDropdownItem
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './training.component.html',
  styleUrl: './training.component.scss'
})
export class TrainingComponent implements OnInit {
  /** Index of the training step to display */
  public currentStepIndex = signal(0);
  /** Display exercise solution */
  public showSolution = signal(false);
  /** Training steps */
  public steps = signal<TrainingStep[]>([]);
  /** Training step names for the dropdown menu */
  public stepNames = computed(() =>
    this.steps().map((step) => step.description.stepTitle)
  );

  /** Path to the training assets */
  public trainingPath = input('');
  /** Title of the training */
  public title = input('');

  private readonly dynamicContentService = inject(DynamicContentService);
  private readonly loggerService = inject(LoggerService);

  /**
   * Load the dynamic content of the specified training step
   * @param step
   */
  private async loadStepContent(step: TrainingStep) {
    if (!step.dynamicContent.htmlContent()) {
      const content = await this.loadResource(step.description.htmlContentUrl);
      if (!content) {
        this.loggerService.error('No step found');
        return;
      }
      step.dynamicContent.htmlContent.set(content);
    }
    const fileConfiguration = step.description.filesConfiguration;
    if (fileConfiguration?.urls && !step.dynamicContent.project()?.files) {
      await this.updateStepDynamicContent(step, fileConfiguration.urls);
    }
    if (fileConfiguration?.urls && fileConfiguration?.solutionUrls && !step.dynamicContent.solutionProject()?.files) {
      await this.updateStepDynamicContent(step, [
        ...fileConfiguration.urls,
        ...fileConfiguration.solutionUrls
      ],
      true);
    }
  }

  /**
   * Load the training steps, including their description and dynamic content
   */
  private async loadSteps() {
    const programFiles = await this.loadResource(`${this.trainingPath()}/program.json`);
    if (!programFiles) {
      this.loggerService.error('No training program found');
      return;
    }
    const program = JSON.parse(programFiles) as TrainingProgram;
    const stepsToLoad: TrainingStep[] = [];
    program.trainingSteps.forEach((desc) => {
      const step: TrainingStep = {
        description: desc,
        dynamicContent: {
          htmlContent: signal(''),
          project: signal(null),
          solutionProject: signal(null)
        }
      };
      void this.loadStepContent(step);
      stepsToLoad.push(step);
    });
    this.steps.set(stepsToLoad);
    const stepParam = window.location.href.match(currentStepLocationRegExp)?.[1];
    const stepRequested = !stepParam || Number.isNaN(stepParam) ? 0 : Number(stepParam);
    this.setCurrentStep(stepRequested);
  }

  /**
   * Load the resource using the provided URL
   * @param url
   */
  private async loadResource(url: string) {
    const resourceUrl = url.startsWith('./') ? `${this.trainingPath()}/${url.substring(2)}` : url;
    const response = await fetch(await firstValueFrom(this.dynamicContentService.getMediaPathStream(resourceUrl)));
    return response.ok ? response.text() : undefined;
  }

  /**
   * Update the dynamic content of the specified training step
   * @param step Training step
   * @param urls URLs of the step project or solution project
   * @param solutionProject Boolean indicating if the dynamic content is the project or solution project of the step
   */
  private async updateStepDynamicContent(step: TrainingStep, urls: StepProjectUrl[], solutionProject = false) {
    const resources = (await Promise.all(
      urls.map(
        async ({ path, contentUrl }) => ({
          path,
          content: await this.loadResource(contentUrl)
        })
      ))).filter((resource) => isTrainingResource(resource));
    const filesContent = getFilesContent(resources);
    step.dynamicContent[solutionProject ? 'solutionProject' : 'project'].set({
      startingFile: step.description.filesConfiguration!.startingFile || '',
      commands: step.description.filesConfiguration!.commands || [],
      files: filesContent,
      cwd: step.description.filesConfiguration!.exerciseId.toLowerCase().replace(' ', '-') + (solutionProject ? '-solution' : '')
    });
  }

  public ngOnInit() {
    void this.loadSteps();
  }

  /**
   * Set the current step index. Also update the browser URL and history.
   * @param index
   */
  public setCurrentStep(index: number) {
    if (index > this.steps().length || index < 0) {
      return;
    }
    this.currentStepIndex.set(index);
    this.showSolution.set(false);

    const newHash = currentStepLocationRegExp.test(location.hash)
      ? location.hash.replace(currentStepLocationRegExp, `#${this.currentStepIndex()}`)
      : `${location.hash}#${this.currentStepIndex()}`;
    history.pushState(null, '', newHash);
  }

  /**
   * Update the display of the exercise solution and the corresponding button label
   */
  public toggleDisplaySolution() {
    this.showSolution.set(!this.showSolution());
  }
}
