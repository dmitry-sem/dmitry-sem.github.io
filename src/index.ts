import {
    combineLatest,
    fromEvent,
    Observable
} from 'rxjs';

import {
    debounceTime,
    distinctUntilChanged,
    filter,
    pluck,
    startWith,
    switchMap
} from 'rxjs/operators';

import './index.css';


const repoNameElem: HTMLInputElement = document.querySelector('#repo-name') as HTMLInputElement;
const repoLanguageElem: HTMLInputElement = document.querySelector('#repo-language') as HTMLInputElement;

const repoNameInput$: Observable<string> = fromEvent(repoNameElem, 'input')
    .pipe(
        pluck('target', 'value')
    );

const repoLanguageInput$: Observable<string> = fromEvent(repoLanguageElem, 'input')
    .pipe(
        startWith({ target: { value: '' } }),
        pluck('target', 'value')
    );

// tslint:disable-next-line:no-any
searchGithubRepos$(repoNameInput$, repoLanguageInput$).subscribe((repos: any[]) => {
    renderRepoList(repos);
});

// tslint:disable-next-line:no-any
function searchGithubRepos$(name$: Observable<string>, language$: Observable<string>): Observable<any[]> {
    return combineLatest([name$, language$]).pipe(
        debounceTime(500),
        distinctUntilChanged(([prevRepoName, prevRepoLanguage]: string[], [curRepoName, curRepoLanguage]: string[]) => {
            return prevRepoName === curRepoName && prevRepoLanguage === curRepoLanguage;
        }),
        filter(([repoName, repoLanguage]: string[]) => Boolean(repoName)),
        switchMap(([repoName, repoLanguage]: string[]) => getGithubRepos(repoName, repoLanguage)),
        pluck('items')
    );
}

// tslint:disable-next-line:no-any
function getGithubRepos(repoName: string, repoLanguage: string): Promise<any> {
    let url: string = `https://api.github.com/search/repositories?q=${repoName}`;
    if (repoLanguage) {
        url += `+language:${repoLanguage}`;
    }
    return fetch(url).then((res: Response) => res.json());
}

// tslint:disable-next-line:no-any
function renderRepoList(repos: any[]): void {
    (document.querySelector('#repo-list') as HTMLDivElement).innerHTML = constructRepoList(repos);
}

// tslint:disable-next-line:no-any
function constructRepoList(repos: any[]): string {
    let resHtml: string = '<ul>';

    for (const repo of repos) {
        resHtml += '<li>';
        if (repo.description) {
            resHtml += `<h4>${repo.description.replace(/<[^>]*>?/gm, '')}</h4>`;
        }
        resHtml += `<h4><a href="${repo.html_url}">${repo.html_url}</a></h4>`;
        resHtml += `<img width="300" height="300" src="${repo.owner.avatar_url}" alt="">`;
        resHtml += '</li>';
    }
    resHtml += '</ul>';

    return resHtml;
}
