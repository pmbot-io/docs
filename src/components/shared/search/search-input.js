import React, { useRef } from 'react';
import classNames from 'classnames';
import { connectSearchBox } from 'react-instantsearch-dom';
import styles from './search.module.scss';

export default connectSearchBox(
  ({ refine, label, queryLength, clearQuery, onFocus, clear }) => {
    const inputRef = useRef(null);
    return (
      <form className={styles.searchForm}>
        <input
          ref={inputRef}
          placeholder={'Search documentation...'}
          className={classNames(styles.searchInput, label)}
          type={'text'}
          aria-label={'Search documentation...'}
          onChange={e => refine(e.target.value)}
          onFocus={onFocus}
        />
        <button
          className={classNames(styles.clearButton, {
            [styles.inactive]: !queryLength,
          })}
          onClick={() => {
            inputRef.current.value = '';
            refine('');
          }}
          type={'button'}
        />
      </form>
    );
  }
);
