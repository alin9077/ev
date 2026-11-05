export type ReportSubmissionToken = Readonly<{
  operation: number;
  revision: number;
  context: string;
  description: string;
}>;
/** Synchronous gate; React state batching cannot admit a second click or clear a later edit. */
export class ReportSubmissionGate {
  private operation = 0;
  private revision = 0;
  private active: number | undefined;
  private context: string;
  private disposed = false;
  constructor(context: string) {
    this.context = context;
  }
  activate(context: string) {
    this.disposed = false;
    this.changeContext(context);
  }
  private changeContext(context: string) {
    if (context !== this.context) {
      this.context = context;
      this.operation++;
      this.revision++;
      this.active = undefined;
    }
  }
  noteEdit(context: string) {
    this.changeContext(context);
    this.revision++;
  }
  begin(
    context: string,
    description: string,
  ): ReportSubmissionToken | undefined {
    if (this.disposed) return undefined;
    this.changeContext(context);
    if (this.active !== undefined) return undefined;
    this.active = ++this.operation;
    return Object.freeze({
      operation: this.active,
      revision: this.revision,
      context,
      description,
    });
  }
  isCurrent(token: ReportSubmissionToken) {
    return (
      !this.disposed &&
      this.operation === token.operation &&
      this.context === token.context
    );
  }
  canPublishFeedback(token: ReportSubmissionToken) {
    return this.isCurrent(token) && this.revision === token.revision;
  }
  canClear(token: ReportSubmissionToken, context: string, description: string) {
    return (
      this.isCurrent(token) &&
      this.revision === token.revision &&
      context === token.context &&
      description === token.description
    );
  }
  hasActive(context: string) {
    return (
      !this.disposed && context === this.context && this.active !== undefined
    );
  }
  finish(token: ReportSubmissionToken): boolean {
    if (!this.isCurrent(token) || this.active !== token.operation) return false;
    this.active = undefined;
    return true;
  }
  dispose() {
    this.disposed = true;
    this.active = undefined;
    this.operation++;
  }
}
