import {
    combineLatest,
    fromEvent,
    Observable
} from 'rxjs';

import {
    debounceTime,
    filter,
    map,
    pluck,
    startWith,
    switchMap
} from 'rxjs/operators';

import './index.css';


const repoNameElem: HTMLInputElement = document.querySelector('#repo-name') as HTMLInputElement;
const repoLanguageElem: HTMLInputElement = document.querySelector('#repo-language') as HTMLInputElement;

const repoNameInput$: Observable<string> = fromEvent(repoNameElem, 'input')
    .pipe(
        map((event: Event) => (event.target as HTMLInputElement).value)
    );

const repoLanguageInput$: Observable<string> = fromEvent(repoLanguageElem, 'input')
    .pipe(
        map((event: Event) => (event.target as HTMLInputElement).value),
        startWith('')
    );

combineLatest([repoNameInput$, repoLanguageInput$]).pipe(
    debounceTime(500),
    filter(([repoName, repoLanguage]: string[]) => Boolean(repoName)),
    switchMap(([repoName, repoLanguage]: string[]) => {
        let url: string = `https://api.github.com/search/repositories?q=${repoName}`;
        if (repoLanguage) {
            url += `+language:${repoLanguage}`;
        }
        return fetch(url);
    }),
    switchMap((res: Response) => res.json()),
    pluck('items')
// tslint:disable-next-line:no-any
).subscribe((repos: any[]) => {
    (document.querySelector('#repo-list') as HTMLDivElement).innerHTML = constructRepoList(repos);
});

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
