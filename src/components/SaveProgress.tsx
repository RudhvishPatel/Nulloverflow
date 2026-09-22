"use client";

/**
 * Save progress UI is visible for layout/IA, but live network writes are
 * disabled until Backend ships DB + encryption-at-rest (AppSec interim).
 */
export default function SaveProgress() {
  return (
    <aside className="save-progress" aria-labelledby="save-progress-title">
      <div className="save-progress-head">
        <h3 id="save-progress-title">SAVE PROGRESS</h3>
        <span className="meta">lab · vault pending</span>
      </div>
      <p className="mono mag-seed" style={{ marginBottom: "0.85rem" }}>
        &gt; contact stash paused — vault store coming (no PII on shared preview)
      </p>
      <form
        onSubmit={(e) => e.preventDefault()}
        noValidate
        aria-disabled="true"
      >
        <div className="save-progress-grid">
          <div className="save-field">
            <label htmlFor="sp-first">First name</label>
            <input id="sp-first" name="firstName" type="text" disabled autoComplete="off" />
          </div>
          <div className="save-field">
            <label htmlFor="sp-surname">Surname</label>
            <input id="sp-surname" name="surname" type="text" disabled autoComplete="off" />
          </div>
          <div className="save-field save-field-full">
            <label htmlFor="sp-email">Email</label>
            <input id="sp-email" name="email" type="email" disabled autoComplete="off" />
          </div>
          <div className="save-field save-field-full">
            <label htmlFor="sp-phone">Phone (optional)</label>
            <input id="sp-phone" name="phone" type="tel" disabled autoComplete="off" />
          </div>
        </div>
        <label className="save-consent">
          <input type="checkbox" disabled />
          <span>
            I consent to Null Overflow storing this contact to restore lab progress.
            Live writes stay off until encrypted vault storage ships.
          </span>
        </label>
        <button type="submit" className="btn btn-signal" disabled>
          Vault store coming
        </button>
        <p className="save-progress-msg mono" role="status">
          &gt; network save disabled · AppSec interim · no file-store PII
        </p>
      </form>
    </aside>
  );
}
